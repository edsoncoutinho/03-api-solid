import { prisma } from '@/lib/prisma'
import { CheckIn, Prisma } from '@prisma/client'
import { CheckInsRepository } from '../check-ins-repository'
import dayjs from 'dayjs'

export class PrismaCheckInsRepository implements CheckInsRepository {
  async create(data: Prisma.CheckInUncheckedCreateInput) {
    return await prisma.checkIn.create({ data })
  }

  async save(data: CheckIn) {
    return await prisma.checkIn.update({
      where: { id: data.id },
      data,
    })
  }

  async findByUserIdOnDate(userId: string, date: Date) {
    const startOfTheDay = dayjs(date).startOf('date').toDate()
    const endOfTheDay = dayjs(date).endOf('date').toDate()

    return await prisma.checkIn.findFirst({
      where: {
        user_id: userId,
        created_at: {
          gte: startOfTheDay,
          lte: endOfTheDay,
        },
      },
    })
  }

  async findManyByUserId(userId: string, page: number) {
    return await prisma.checkIn.findMany({
      where: { user_id: userId },
      skip: (page - 1) * 20,
      take: 20,
      orderBy: { created_at: 'desc' },
    })
  }

  async countByUserId(userId: string) {
    return await prisma.checkIn.count({ where: { user_id: userId } })
  }

  async findById(id: string) {
    return await prisma.checkIn.findUnique({ where: { id } })
  }
}
