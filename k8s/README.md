## Build the pipeline


1. **Setup parameters** Alter, or copy the _bcrs-entities-create-ui-build-pipeline.param_ updating the values for your pipeline.
2. **Create the pipeline** process the template referencing your parameter file.

```bash 
oc process -f templates/bcrs-entities-create-ui-pipeline.json -p bcrs-entities-create-ui-build-pipeline.param  | oc create -f -
```