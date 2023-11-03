export class MessageDTO {
  constructor (message: MessageDTO) {
    this.id = message.id
    this.content = message.content
    this.senderId = message.senderId
    this.receiverId = message.receiverId
    this.createdAt = message.createdAt
  }

  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: Date
}

export class MessageInputDTO {
  constructor (message: MessageInputDTO) {
    this.content = message.content
    this.senderId = message.senderId
    this.receiverId = message.receiverId
  }

  content: string
  senderId: string
  receiverId: string
}
