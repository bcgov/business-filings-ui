<template>
  <v-menu
    bottom
    nudge-top="33"
    nudge-left="20"
    v-model="showComments"
    :close-on-click="false"
    :close-on-content-click="false"
  >
    <!-- the button -->
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        small text color="primary"
        id="comments-button"
        v-bind="attrs"
        v-on="on"
      >
        <v-icon medium>mdi-comment-text-outline</v-icon>
        <span>{{numComments}}</span>
      </v-btn>
    </template>

    <!-- the menu (dialog) -->
    <v-card flat id="staff-comment-container" class="px-8 py-6">
      <v-card-title class="d-flex justify-space-between pa-0">
        <div>
          <v-icon medium color="primary">mdi-comment-text-outline</v-icon>
          <span>{{numComments}}</span>
        </div>
        <v-btn icon large class="mr-n3" @click="close()">
          <v-icon color="primary">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="mt-2 pa-0">
        <v-textarea
          ref="textarea"
          autofocus
          no-resize
          filled
          rows="5"
          v-model="comment"
          placeholder="Enter Comments"
          :rules="rules"
        />
      </v-card-text>

      <v-card-actions class="d-flex justify-space-between pa-0">
        <div class="body-2 mt-1">{{charsRemaining}}</div>
        <div class="mr-n3">
          <v-btn text color="primary" class="font-weight-bold" :loading="isSaving" @click="save()">
            Save
          </v-btn>
          <v-btn text color="primary" @click="close()">
            Cancel
          </v-btn>
        </div>
      </v-card-actions>

      <v-card-text class="mt-6 pa-0">
        <div class="existing-comments pr-5">
          <div v-for="(comment, i) in comments" :key="i" class="body-2">
            <p class="pre-line" v-html="comment.comment" />
            <p class="font-italic">
              {{ comment.submitterDisplayName }}
              &hyphen;
              {{apiToSimpleDateTime(comment.timestamp)}}
            </p>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { CommentIF, FormIF } from '@/interfaces'
import { DateMixin, FilingMixin } from '@/mixins'

@Component({})
export default class StaffComments extends Mixins(DateMixin, FilingMixin) {
  $refs!: Vue['$refs'] & {
    textarea: FormIF
  }

  /** Axios instance prop. */
  @Prop({ required: true })
  readonly axios: any

  /** Business ID prop. */
  @Prop({ required: true })
  readonly businessId: string

  /** Max Length prop (optional). */
  @Prop({ default: 4096 })
  readonly maxLength: number

  /** Model property for v-menu (ie, whether to show the dialog). */
  private showComments = false

  /** The list of comments. */
  private comments: Array<CommentIF> = []

  /** The new comment's text. */
  private comment: string = null

  /** Whether a comment is being saved. */
  private isSaving = false

  /** The number of chars remaining in the new comment. */
  private get charsRemaining (): number {
    const length = this.comment?.length || 0 // comment may be null
    return (this.maxLength - length)
  }

  /** The Number of Comments string for this entity. */
  private get numComments (): string {
    const numComments = this.comments.length
    return (numComments === 1 ? '1 Comment' : `${numComments} Comments`)
  }

  /** Array of validations rules for the textarea. */
  private get rules (): Array<Function> {
    // exclude whitespace in minimum length check
    // include whitespace in maximum length check
    return [
      val => (val && val.trim().length > 0) || 'Enter a comment.',
      val => (val && val.length <= this.maxLength) || 'Maximum characters reached.'
    ]
  }

  /** Called when the component is mounted. */
  private async mounted (): Promise<void> {
    await this.fetchStaffComments()
  }

  /** Fetches the staff comments from the API. */
  private async fetchStaffComments (): Promise<void> {
    const url = `businesses/${this.businessId}/comments`
    this.comments = await this.axios.get(url)
      .then(resp => this.flattenAndSortComments(resp?.data?.comments))
      .catch(() => [])
  }

  /** Saves the new comment to the API. */
  private async save (): Promise<void> {
    // don't save if invalid
    if (!this.$refs.textarea.validate()) return

    // prevent double saving
    if (this.isSaving) return
    this.isSaving = true

    const url = `businesses/${this.businessId}/comments`
    const data = {
      comment: {
        businessId: this.businessId,
        comment: this.comment
      }
    }

    let success = false
    await this.axios.post(url, data).then(res => {
      success = true
    }).catch(error => {
      // eslint-disable-next-line no-console
      console.log('save() error =', error)
      alert('Could not save your comment. Please try again or cancel.')
    })

    this.isSaving = false
    if (success) {
      // clear the data and reload the staff comments
      this.$refs.textarea.reset()
      await this.fetchStaffComments()
    }
  }

  /** Closes the menu (dialog). */
  private close (): void {
    // clear any errors; leave the data
    this.$refs.textarea.resetValidation()
    this.showComments = false
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#staff-comment-container {
  width: 33rem;
  height: 36rem;
  overflow: hidden;
}

.v-card__title {
  .v-icon {
    margin-top: 1px;
  }

  span {
    color: $primary-blue;
    font-size: 0.75rem;
    letter-spacing: normal;
    margin-left: 5px;
  }
}

::v-deep .v-textarea textarea {
  font-size: 0.875rem !important;
  color: $gray7 !important;
}

// reduce overall textarea height when there are no error messages
::v-deep .v-textarea:not(.error--text) {
  margin-bottom: -24px;
}

// reduce overall textarea height when there are errors messages
::v-deep .v-textarea.error--text {
  margin-bottom: -12px;
}

// shrink input area to make space for error messages
::v-deep .v-textarea.error--text textarea {
  height: calc(140px - 12px) !important;
}

.v-card__actions .body-2 {
  color: $gray7;
}

.existing-comments {
  height: 16rem;
  max-height: 16rem;
  overflow-y: scroll;

  .body-2 {
    color: $gray7;
    line-height: 1.375rem;
  }

  .body-2 + .body-2 {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid $gray7;
    border-radius: 0;
  }
}
</style>
