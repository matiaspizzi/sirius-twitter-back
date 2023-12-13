import { MessageDTO, MessageInputDTO } from '../dto'

export interface MessageRepository {
  create: (data: MessageInputDTO) => Promise<MessageDTO>
  getChats: (userId: string) => Promise<MessageDTO[]>
  getChat: (userId: string, to: string) => Promise<MessageDTO[]>
}
