import { LoginInputDTO, SignupInputDTO } from '../dto'

export interface AuthService {
  signup: (data: SignupInputDTO) => Promise<{ userId: string, token: string }>
  login: (data: LoginInputDTO) => Promise<{ userId: string, token: string }>
  verifyToken: (token: string) => {isValid: boolean}
}
