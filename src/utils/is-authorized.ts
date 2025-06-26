import { useRootStore } from '@/stores/rootStore'
import { AuthorizedActions } from '@/enums'

/**
 * Whether the specified action is authorized for the current user.
 * @returns True or False
 */
export function IsAuthorized (action: AuthorizedActions): boolean {
  const rootStore = useRootStore()
  return rootStore.getAuthorizedActions.includes(action)
}
