<template>
  <div />
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator'
import { io } from 'socket.io-client'
import { useConfigurationStore } from '@/stores'
import { Getter } from 'pinia-class'
import { WebSocketEvents, WebSocketTopics } from '@/enums'
import { WalletConnectionIF, DigitalCredentialIF } from '@/interfaces'

@Component
export default class CredentialsWebSocket extends Vue {
  @Getter(useConfigurationStore) getLegalApiBaseUrl!: string

  socket: any = null

  mounted (): void {
    this.socket = io(this.getLegalApiBaseUrl)

    this.socket.on(WebSocketEvents.CONNECT, this.handleConnect)
    this.socket.on(WebSocketEvents.DISCONNECT, this.handleDisconnect)

    this.socket.on(WebSocketTopics.CONNECTIONS, this.handleConnectionsMessage)
    this.socket.on(WebSocketTopics.ISSUE_CREDENTIAL_V2_0, this.handleIssuedCredentialMessage)
  }

  destroyed (): void {
    this.socket.disconnect()
  }

  handleConnect (): void {
    console.log('Socket connected:', this.socket.id)
  }

  handleDisconnect (): void {
    console.log('Socket disconnected')
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
