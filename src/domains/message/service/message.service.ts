import { MessageDTO } from '../dto'

export interface MessageService {
  getMessages: (userId: string, to: string) => Promise<MessageDTO[]>
  newMessage: (userId: string, to: string, content: string) => Promise<MessageDTO>
}
