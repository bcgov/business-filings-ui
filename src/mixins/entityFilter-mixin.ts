import { Component, Vue } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { EntityTypes } from '@/enums'

/**
 * Mixin that provides an entity filter utility.
 */
@Component({
  computed: {
    ...mapState(['entityType'])
  }
})
export default class EntityFilterMixin extends Vue {
  readonly entityType!: EntityTypes

  /**
   * Compares the conditional entity to the entityType defined from the Store.
   *
   * @param entity the entity type of the component
   * @return True if the entityType given matches the entityType assigned to the component, else False
   */
  entityFilter (entityType: EntityTypes): boolean {
    return this.entityType === entityType
  }
}
