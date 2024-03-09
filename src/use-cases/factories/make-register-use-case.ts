import { RegisterUseCase } from '../register'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-uses-repository'

export function makeRegisterUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const registerUseCase = new RegisterUseCase(usersRepository)

  return registerUseCase
}
