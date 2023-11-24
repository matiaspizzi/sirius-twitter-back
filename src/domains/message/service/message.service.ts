import { MessageDTO } from '../dto'

export interface MessageService {
  getMessages: (userId: string, receiverId: string) => Promise<MessageDTO[]>
  newMessage: (userId: string, receiverId: string, content: string) => Promise<MessageDTO>
}
