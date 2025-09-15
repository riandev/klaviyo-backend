import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('events')
@Index(['eventName', 'createdAt'])
@Index(['createdAt'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  eventName: string;

  @Column({ type: 'json', nullable: true })
  eventAttributes: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  profileAttributes: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  profileId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'date' })
  eventDate: string;

  @Column({ type: 'boolean', default: false })
  sentToKlaviyo: boolean;

  @Column({ type: 'text', nullable: true })
  klaviyoResponse: string;
}
