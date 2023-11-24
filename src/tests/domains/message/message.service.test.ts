import { describe, test } from '@jest/globals'
import { MessageDTO } from '../../../domains/message/dto'
import { MessageRepository, MessageRepositoryImpl } from '../../../domains/message/repository'
import { db } from '../../../utils'
import { MessageService, MessageServiceImpl } from '../../../domains/message/service'
import { FollowerRepository, FollowerRepositoryImpl } from '@domains/follower/repository'
import { NotFoundException } from '../../../utils/errors'
import { FollowerDTO } from '@domains/follower/dto'
import { UserRepository, UserRepositoryImpl } from '@domains/user/repository'
import { ExtendedUserDTO } from '@domains/user/dto'

describe('MessageService', () => {
  const messageRepositoryMock: MessageRepository = new MessageRepositoryImpl(db)
  const followerRepositoryMock: FollowerRepository = new FollowerRepositoryImpl(db)
  const userRepositoryMock: UserRepository = new UserRepositoryImpl(db)
  const messageService: MessageService = new MessageServiceImpl(messageRepositoryMock, followerRepositoryMock, userRepositoryMock)

  const message: MessageDTO = { id: '1', senderId: '1', receiverId: '2', content: 'Hello', createdAt: new Date() }
  const follow: FollowerDTO = { id: '1', followerId: '1', followedId: '2', createdAt: new Date() }
  const user: ExtendedUserDTO = { id: '1', username: 'username', createdAt: new Date(), isPrivate: false, profilePicture: 'profilePicture', email: 'email', name: 'name', password: 'password' }

  test('sendMessage() should return a MessageDTO object', async () => {
    jest.spyOn(followerRepositoryMock, 'getByIds').mockImplementation(async () => await Promise.resolve(follow))
    jest.spyOn(messageRepositoryMock, 'create').mockImplementation(async () => await Promise.resolve(message))
    const messageCreated: MessageDTO = await messageService.newMessage(
      message.senderId,
      message.receiverId,
      message.content
    )

    expect(messageCreated.id).toBeDefined()
    expect(messageCreated.senderId).toEqual(message.senderId)
    expect(messageCreated.receiverId).toEqual(message.receiverId)
    expect(messageCreated.content).toEqual(message.content)
  })

  test('sendMessage() should throw a NotFoundException when user do not follow back each other', async () => {
    jest.spyOn(followerRepositoryMock, 'getByIds').mockImplementation(async () => await Promise.resolve(null))
    try {
      await messageService.newMessage(message.senderId, message.receiverId, message.content)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('sendMessage() should throw a NotFoundException when user does not exist', async () => {
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(null))
    try {
      await messageService.newMessage(message.senderId, message.receiverId, message.content)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  test('getMessages() should return a MessageDTO object', async () => {
    jest.spyOn(messageRepositoryMock, 'getByUserIds').mockImplementation(async () => await Promise.resolve([message]))
    jest.spyOn(userRepositoryMock, 'getById').mockImplementation(async () => await Promise.resolve(user))
    const messages: MessageDTO[] = await messageService.getMessages(message.senderId, message.receiverId)

    expect(messages.length).toBeGreaterThan(0)
    expect(messages[0].id).toBeDefined()
    expect(messages[0].senderId).toEqual(message.senderId)
    expect(messages[0].receiverId).toEqual(message.receiverId)
    expect(messages[0].content).toEqual(message.content)
  })

  test('getMessages() should throw a NotFoundException when messages do not exist', async () => {
    jest.spyOn(messageRepositoryMock, 'getByUserIds').mockImplementation(async () => await Promise.resolve([]))
    try {
      await messageService.getMessages(message.senderId, message.receiverId)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })
})
