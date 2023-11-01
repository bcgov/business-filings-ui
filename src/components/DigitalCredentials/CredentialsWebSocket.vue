<template>
  <div id="credentials-web-socket" />
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'
import { useBusinessStore, useConfigurationStore } from '@/stores'
import { Getter } from 'pinia-class'
import { WalletConnectionIF, DigitalCredentialIF } from '@/interfaces'
import { Observable, Subscription, interval, of } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'
import { LegalServices } from '@/services'

@Component
export default class CredentialsWebSocket extends Vue {
  @Getter(useConfigurationStore) getLegalApiUrl!: string
  @Getter(useBusinessStore) getIdentifier!: string

  @Prop({ default: null }) readonly connection!: WalletConnectionIF;
  @Prop({ default: null }) readonly issuedCredential!: DigitalCredentialIF;

  connectionsSubscription: Subscription;
  issueCredentialV20Subscription: Subscription;

  connections$: Observable<WalletConnectionIF | null>;
  issueCredentialV20$: Observable<DigitalCredentialIF | null>;

  mounted (): void {
    this.connections$ =
      interval(1000)
        .pipe(
          switchMap(() => LegalServices.fetchCredentialConnections(this.getIdentifier)),
          map(({ data }) => data?.connections[0] || null),
          catchError(() => of(null))
        )

    this.issueCredentialV20$ =
      interval(1000)
        .pipe(
          switchMap(() => LegalServices.fetchCredentials(this.getIdentifier)),
          map(({ data }) => data?.issuedCredentials[0] || null),
          catchError(() => of(null))
        )
  }

  destroyed (): void {
    this.unsubscribeConnections()
    this.unsubscribeIssueCredentialV20()
  }

  subscribeConnections (): void {
    this.connectionsSubscription = this.connections$
      .subscribe((connection) => {
        if (connection) {
          this.handleConnectionsMessage(connection)
        }
      })
  }

  subscribeIssueCredentialV20 (): void {
    this.issueCredentialV20Subscription = this.issueCredentialV20$
      .subscribe((issuedCredential) => {
        if (issuedCredential) {
          this.handleIssuedCredentialMessage(issuedCredential)
        }
      })
  }

  unsubscribeConnections (): void {
    if (this.connectionsSubscription && !this.connectionsSubscription.closed) {
      this.connectionsSubscription.unsubscribe()
    }
  }

  unsubscribeIssueCredentialV20 (): void {
    if (this.issueCredentialV20Subscription && !this.issueCredentialV20Subscription.closed) {
      this.issueCredentialV20Subscription.unsubscribe()
    }
  }

  @Watch('connection', { immediate: true })
  onConnectionChanged (connection: WalletConnectionIF): void {
    this.unsubscribeConnections()
    if (connection && !connection.isActive) {
      this.subscribeConnections()
    }
  }

  @Watch('issuedCredential', { immediate: true })
  onIssuedCredentialChanged (issuedCredential: DigitalCredentialIF): void {
    this.unsubscribeIssueCredentialV20()
    if (issuedCredential && !issuedCredential.isIssued) {
      this.subscribeIssueCredentialV20()
    }
  }

  @Emit('onConnection')
  handleConnectionsMessage (connection: WalletConnectionIF): WalletConnectionIF {
    return connection
  }

  @Emit('onIssuedCredential')
  handleIssuedCredentialMessage (issuedCredential: DigitalCredentialIF): DigitalCredentialIF {
    return issuedCredential
  }
}
</script>
