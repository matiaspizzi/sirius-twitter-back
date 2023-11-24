export class UserDTO {
  constructor (user: UserDTO) {
    this.id = user.id
    this.username = user.username
    this.isPrivate = user.isPrivate
    this.createdAt = user.createdAt
    this.profilePicture = user.profilePicture
  }

  id: string
  username: string
  isPrivate: boolean
  createdAt: Date
  profilePicture: string | null
}

export class ExtendedUserDTO extends UserDTO {
  constructor (user: ExtendedUserDTO) {
    super(user)
    this.email = user.email
    this.password = user.password
    this.name = user.name
    this.isPrivate = user.isPrivate
  }

  email!: string
  name: string | null
  password!: string
}
export class UserViewDTO {
  constructor (user: UserViewDTO) {
    this.id = user.id
    this.name = user.name
    this.username = user.username
    this.profilePicture = user.profilePicture
    this.isPrivate = user.isPrivate
  }

  isPrivate: boolean
  id: string
  name: string | null
  username: string
  profilePicture: string | null
}
