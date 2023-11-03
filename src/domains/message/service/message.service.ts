import { MessageDTO } from '../dto'

export interface MessageService {
  getMessages: (userId: string, receiverId: string) => Promise<MessageDTO[]>
  sendMessage: (userId: string, receiverId: string, content: string) => Promise<MessageDTO>
}
