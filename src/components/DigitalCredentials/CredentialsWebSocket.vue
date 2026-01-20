<template>
  <div id="credentials-web-socket" />
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator'
import { useBusinessStore } from '@/stores'
import { Getter } from 'pinia-class'
import { WalletConnectionIF, DigitalCredentialIF } from '@/interfaces'
import { Observable, Subscription, interval, of } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'
import { BusinessServices } from '@/services'

@Component
export default class CredentialsWebSocket extends Vue {
  @Getter(useBusinessStore) getIdentifier!: string

  @Prop({ default: null }) readonly connection!: WalletConnectionIF
  @Prop({ default: null }) readonly issuedCredential!: DigitalCredentialIF

  connectionSubscription: Subscription
  attestationSubscription: Subscription
  issuedCredentialSubscription: Subscription

  connection$: Observable<WalletConnectionIF | null>
  issuedCredential$: Observable<DigitalCredentialIF | null>

  mounted (): void {
    this.connection$ =
      interval(1000)
        .pipe(
          switchMap(() => BusinessServices.fetchCredentialConnections(this.getIdentifier)),
          map(({ data }) => data?.connections[0] || null),
          catchError(() => of(null))
        )

    this.issuedCredential$ =
      interval(1000)
        .pipe(
          switchMap(() => BusinessServices.fetchCredentials(this.getIdentifier)),
          map(({ data }) => data?.issuedCredentials[0] || null),
          catchError(() => of(null))
        )
  }

  destroyed (): void {
    this.unsubscribeConnection()
    this.unsubscribeAttestation()
    this.unsubscribeIssuedCredential()
  }

  subscribeConnection (): void {
    this.connectionSubscription = this.connection$
      .subscribe((connection) => {
        if (connection) {
          this.handleConnectionMessage(connection)
        }
      })
  }

  subscribeAttestation (): void {
    this.attestationSubscription = this.connection$
      .subscribe((connection) => {
        if (connection?.lastAttested && connection?.lastAttested !== null) {
          this.handleConnectionMessage(connection)
        }
      })
  }

  subscribeIssuedCredential (): void {
    this.issuedCredentialSubscription = this.issuedCredential$
      .subscribe((issuedCredential) => {
        if (issuedCredential) {
          this.handleIssuedCredentialMessage(issuedCredential)
        }
      })
  }

  unsubscribeConnection (): void {
    if (this.connectionSubscription && !this.connectionSubscription.closed) {
      this.connectionSubscription.unsubscribe()
    }
  }

  unsubscribeAttestation (): void {
    if (this.attestationSubscription && !this.attestationSubscription.closed) {
      this.attestationSubscription.unsubscribe()
    }
  }

  unsubscribeIssuedCredential (): void {
    if (this.issuedCredentialSubscription && !this.issuedCredentialSubscription.closed) {
      this.issuedCredentialSubscription.unsubscribe()
    }
  }

  @Watch('connection', { immediate: true })
  onConnectionChanged (connection: WalletConnectionIF): void {
    this.unsubscribeConnection()
    this.unsubscribeAttestation()
    if (connection) {
      if (!connection?.isActive) {
        this.subscribeConnection()
      } else if (!connection?.isAttested && !connection?.lastAttested) {
        this.subscribeAttestation()
      }
    }
  }

  @Watch('issuedCredential', { immediate: true })
  onIssuedCredentialChanged (issuedCredential: DigitalCredentialIF): void {
    this.unsubscribeIssuedCredential()
    if (issuedCredential && !issuedCredential.isIssued) {
      this.subscribeIssuedCredential()
    }
  }

  @Emit('onConnection')
  @Emit('onAttestation')
  handleConnectionMessage (connection: WalletConnectionIF): WalletConnectionIF {
    return connection
  }

  @Emit('onIssuedCredential')
  handleIssuedCredentialMessage (issuedCredential: DigitalCredentialIF): DigitalCredentialIF {
    return issuedCredential
  }
}
</script>
