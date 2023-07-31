<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="generic-error-dialog"
  >
    <v-card>
      <v-container>
        <v-row justify="center">
          <v-col cols="2" />
          <v-col
            cols="8"
            lg="8"
            class="text-center"
          >
            <v-icon
              size="48"
              :color="iconColor"
              class="mb-6"
            >
              {{ icon }}
            </v-icon>
          </v-col>
          <v-col cols="2">
            <v-icon
              color="primary"
              class="mb-6 float-right"
              @click="okay()"
            >
              mdi-close
            </v-icon>
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col
            cols="12"
            lg="8"
            class="text-center"
          >
            <h1
              class="mb-5"
              style="font-size: 24px"
            >
              {{ summary }}
            </h1>
            <p
              class="mb-9"
              style="font-size: 16px"
            >
              <slot name="description">
                {{ description }}
              </slot>
            </p>
            <slot name="actions">
              <v-btn
                large
                link
                color="primary"
                @click="okay()"
              >
                OK
              </v-btn>
            </slot>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from 'vue-property-decorator'

@Component({
  components: {}
})
export default class GenericErrorDialog extends Vue {
  @Prop({ default: '' }) private summary: string
  @Prop({ default: '' }) private description: string
  @Prop({ default: 'mdi-information-outline' }) private icon: string
  @Prop({ default: 'primary' }) private iconColor: string

  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Pass click event to parent.
  @Emit() okay () {
  }
}
</script>
