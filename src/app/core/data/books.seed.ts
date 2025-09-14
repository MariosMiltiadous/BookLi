import { IBook } from '../models/book.interface';

export const DEFAULT_BOOKS_SEED: ReadonlyArray<IBook> = [
  { id: '1',  title: 'Clean Code', author: 'Robert C. Martin', year: 2008, genre: 'Software' },
  { id: '2',  title: 'The Pragmatic Programmer', author: 'Hunt/Thomas', year: 1999, genre: 'Software' },
  { id: '3',  title: 'Refactoring', author: 'Martin Fowler', year: 2018, genre: 'Software' },
  { id: '4',  title: 'Design Patterns', author: 'Gamma/Helm/Johnson/Vlissides', year: 1994, genre: 'Software' },
  { id: '5',  title: "You Don't Know JS Yet", author: 'Kyle Simpson', year: 2020, genre: 'Software' },
  { id: '6',  title: 'Clean Architecture', author: 'Robert C. Martin', year: 2017, genre: 'Software' },
  { id: '7',  title: 'Domain-Driven Design', author: 'Eric Evans', year: 2003, genre: 'Software' },
  { id: '8',  title: 'Working Effectively with Legacy Code', author: 'Michael C. Feathers', year: 2004, genre: 'Software' },
  { id: '9',  title: 'The Mythical Man-Month', author: 'Frederick P. Brooks Jr.', year: 1975, genre: 'Non-fiction' },
  { id: '10', title: 'Introduction to Algorithms', author: 'Cormen/Leiserson/Rivest/Stein', year: 2009, genre: 'Science' },
] as const;
