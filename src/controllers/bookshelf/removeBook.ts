import { Request, Response, NextFunction } from 'express';
import { getRepository, getConnection } from 'typeorm';
import Book from '../../entities/book';
import Bookshelf from '../../entities/bookshelf';
import { UnauthorizedError, InvalidParamError, NotFoundError } from '../../utils/errors';

interface RemoveBookRequest extends Request {
  params: {
    bookshelfId: string;
    bookId: string;
  };
}

const removeBook = async (
  req: RemoveBookRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('인증 정보가 없습니다.');
    }

    const {
      params: { bookshelfId, bookId },
      user: { id: userId },
    } = req;

    if (!bookshelfId || !bookId) {
      throw new InvalidParamError();
    }

    const parsedBookshelfId = parseInt(bookshelfId, 10);
    const parsedBookId = parseInt(bookId, 10);

    const bookshelf = await getRepository(Bookshelf)
      .createQueryBuilder('bookshelf')
      .innerJoinAndSelect('bookshelf.books', 'book')
      .where('bookshelf.id = :bookshelfId', { bookshelfId: parsedBookshelfId })
      .andWhere('bookshelf.userId = :userId', { userId })
      .andWhere('book.id = :bookId', { bookId: parsedBookId })
      .getOne();

    if (!bookshelf) {
      throw new NotFoundError();
    }

    const book = await getRepository(Book).findOne(parsedBookId);

    if (!book) {
      throw new NotFoundError();
    }

    await getConnection()
      .createQueryBuilder()
      .relation(Bookshelf, 'books')
      .of(bookshelf)
      .remove({ id: book.id });

    res.status(200).json({
      success: true,
      message: null,
      result: {
        removedBook: book,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default removeBook;
