#!/usr/bin/env groovy
// Copyright © 2018 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//JENKINS DEPLOY ENVIRONMENT VARIABLES:
// - JENKINS_JAVA_OVERRIDES  -Dhudson.model.DirectoryBrowserSupport.CSP= -Duser.timezone=America/Vancouver
//   -> user.timezone : set the local timezone so logfiles report correxct time
//   -> hudson.model.DirectoryBrowserSupport.CSP : removes restrictions on CSS file load, thus html pages of test reports are displayed pretty
//   See: https://docs.openshift.com/container-platform/3.9/using_images/other_images/jenkins.html for a complete list of JENKINS env vars
// define constants
def NAMESPACE = '1rdehl'
def COMPONENT_NAME = 'business-filings'
def SOURCE_TAG = 'latest'
def DEPLOY_TAG = 'dev'
def PREV_TAG = "${DEPLOY_TAG}-previous"

// define groovy functions
import groovy.json.JsonOutput

// Get an image's hash tag
String getImageTagHash(String imageName, String tag = "") {

  if(!tag?.trim()) {
    tag = "latest"
  }

  def istag = openshift.raw("get istag ${imageName}:${tag} -o template --template='{{.image.dockerImageReference}}'")
  return istag.out.tokenize('@')[1].trim()
}

// pipeline
// define job properties - keep 10 builds only
properties([
    [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '10'
        ]
    ]
])

node {
    def old_version
    stage("Deploy ${COMPONENT_NAME}:${DEPLOY_TAG}") {
        script {
            openshift.withCluster() {
                openshift.withProject("${NAMESPACE}-${DEPLOY_TAG}") {
                    old_version = openshift.selector('dc', "${COMPONENT_NAME}-${DEPLOY_TAG}").object().status.latestVersion
                }
            }
            openshift.withCluster() {
                openshift.withProject() {

                    echo "Tagging ${COMPONENT_NAME}:${DEPLOY_TAG} to ${DEPLOY_TAG}-previous ..."

                    // Don't tag with BUILD_ID so the pruner can do it's job; it won't delete tagged images.
                    // Tag the images for deployment based on the image's hash
                    def IMAGE_HASH = getImageTagHash("${COMPONENT_NAME}", "${DEPLOY_TAG}")
                    echo "IMAGE_HASH: ${IMAGE_HASH}"
                    openshift.tag("${COMPONENT_NAME}@${IMAGE_HASH}", "${COMPONENT_NAME}:${DEPLOY_TAG}-previous")

                    echo "Tagging ${COMPONENT_NAME} for deployment to ${DEPLOY_TAG} ..."

                    IMAGE_HASH = getImageTagHash("${COMPONENT_NAME}", "${SOURCE_TAG}")
                    echo "IMAGE_HASH: ${IMAGE_HASH}"
                    openshift.tag("${COMPONENT_NAME}@${IMAGE_HASH}", "${COMPONENT_NAME}:${DEPLOY_TAG}")
                }
            }
        }
    }
    stage("Verify deployment") {
        sleep 10
        script {
            openshift.withCluster() {
                openshift.withProject("${NAMESPACE}-${DEPLOY_TAG}") {
                    def new_version = openshift.selector('dc', "${COMPONENT_NAME}-${DEPLOY_TAG}").object().status.latestVersion
                    if (new_version == old_version) {
                        echo "New deployment was not triggered."
                        currentBuild.result = "FAILURE"
                        return
                    }
                    def pod_selector = openshift.selector('pod', [ app:"${COMPONENT_NAME}-${DEPLOY_TAG}" ])
                    pod_selector.untilEach {
                        deployment = it.objects()[0].metadata.labels.deployment
                        echo deployment
                        if (deployment ==  "${COMPONENT_NAME}-${DEPLOY_TAG}-${new_version}" && it.objects()[0].status.phase == 'Running' && it.objects()[0].status.containerStatuses[0].ready) {
                            return true
                        } else {
                            echo "Pod for new deployment not ready"
                            sleep 5
                            return false
                        }
                    }
                }
            }
        }
    }
}
