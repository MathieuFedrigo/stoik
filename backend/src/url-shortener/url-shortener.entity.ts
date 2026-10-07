import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('url_shorteners')
export class UrlShortener {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  url!: string;

  @Column({ type: 'varchar', length: 8, unique: true })
  hash!: string;


  get shortUrl(): string {
    const origin = process.env.SHORT_URL_ORIGIN ?? 'http://localhost:5174';
    return `${origin.replace(/\/$/, '')}/${this.hash}`;
  }
}
