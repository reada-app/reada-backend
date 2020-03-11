import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import Book from '../../entities/book';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../../libs/constants';
import { InvalidParamError } from '../../libs/customErrors';
import { BookList } from '../../types';

export enum EnumBookListType {
  recent = 'recent',
  popular = 'popular',
  recommend = 'recomend',
}

interface GetBookListRequest extends Request {
  query: {
    type: string;
    page: number;
    limit: number;
  };
}

const getBooks = async (
  req: GetBookListRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      query: { type = EnumBookListType.recent, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT },
    } = req;

    if (!(type in EnumBookListType)) {
      throw new InvalidParamError('type이 올바르지 않습니다.');
    }

    const offset = (page - 1) * limit;

    const getRecentBookListInfo = async (): Promise<BookList> => {
      const total = await getRepository(Book)
        .createQueryBuilder('book')
        .getCount();
      const [books, count] = await getRepository(Book)
        .createQueryBuilder('book')
        .limit(limit)
        .offset(offset)
        .orderBy('book.id', 'DESC')
        .getManyAndCount();
      return {
        books,
        count,
        total,
      };
    };

    let initialBookItemsInfo: BookList = {
      books: [],
      total: 0,
      count: 0,
    };

    // 모양이 영 마음에 안 드는데 더 깔끔한 방법이 생기면 수정하기로 하자
    switch (type) {
      case 'popular': {
        break;
      }
      default: {
        const recentInfo = await getRecentBookListInfo();
        initialBookItemsInfo = {
          ...recentInfo,
        };
        break;
      }
    }

    res.status(200).json({
      success: true,
      message: null,
      result: {
        books: initialBookItemsInfo.books,
        pageInfo: {
          total: initialBookItemsInfo.total,
          current: page,
          limit,
          count: initialBookItemsInfo.count,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export default getBooks;
