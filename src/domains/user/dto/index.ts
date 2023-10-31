export class UserDTO {
  constructor (user: UserDTO) {
    this.id = user.id
    this.name = user.name
    this.isPrivate = user.isPrivate
    this.createdAt = user.createdAt
    this.profilePicture = user.profilePicture
  }

  id: string
  name: string | null
  isPrivate: boolean
  createdAt: Date
  profilePicture: string | null
}

export class ExtendedUserDTO extends UserDTO {
  constructor (user: ExtendedUserDTO) {
    super(user)
    this.email = user.email
    this.password = user.password
  }

  email!: string
  username!: string
  password!: string
}
export class UserViewDTO {
  constructor (user: UserViewDTO) {
    this.id = user.id
    this.name = user.name
    this.username = user.username
    this.profilePicture = user.profilePicture
  }

  id: string
  name: string | null
  username: string
  profilePicture: string | null
}
