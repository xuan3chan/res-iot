import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@libs/database';
import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FormData = require('form-data');

@Injectable()
export class FaceVerificationService {
    private readonly faceServiceUrl: string;

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        this.faceServiceUrl = this.configService.get<string>('FACE_SERVICE_URL') || 'http://localhost:8000';
    }

    async registerFace(userId: string, imageBuffer: Buffer, filename: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const vector = await this.extractVector(imageBuffer, filename);
        if (!vector) {
             throw new HttpException('No face detected', HttpStatus.BAD_REQUEST);
        }

        user.faceVector = vector;
        user.hasFaceRegistered = true;
        
        return this.userRepository.save(user);
    }

    async verifyFace(imageBuffer: Buffer, filename: string): Promise<{ user: User; similarity: number } | null> {
        const vector = await this.extractVector(imageBuffer, filename);
        if (!vector) {
            throw new HttpException('No face detected', HttpStatus.BAD_REQUEST);
        }

        // Ideally use pgvector cosine distance in SQL. For now fetching users with vectors.
        // Or if we implemented custom query in repository, use that.
        // Assuming naive implementation for now or reusing previous logic if any.
        // Implementation plan mentions pgvector. 
        // Let's implement fetching all users and checking in memory for simplicity/speed if dataset is small, 
        // OR better: use raw query for cosine similarity.

        // Raw query approach for performance
        // const users = await this.userRepository
        //     .createQueryBuilder('user')
        //     .where('user.faceVector IS NOT NULL')
        //     .getMany();
        // Thay vì getMany() và for loop, hãy dùng query này:
        const closestUser = await this.userRepository
            .createQueryBuilder('user')
            .orderBy(`user.faceVector <=> :vector`, 'ASC') // <=> là toán tử khoảng cách cosine trong pgvector
            .setParameters({ vector: JSON.stringify(vector) }) // pgvector nhận string "[1,2,3]"
            .limit(1)
            .getOne();

        if (!closestUser) {
            return null;
        }

        // console.log(`[VerifyFace] Checking closest user match`);

        let userVector = closestUser.faceVector;

        if (typeof userVector === 'string') {
            try {
                userVector = JSON.parse(userVector);
            } catch (e) {
                console.error(`[VerifyFace] Failed to parse vector for user ${closestUser.id}`); // Changed to id just in case email is not selected, though likely is. Previous code used email.
                return null; 
            }
        }

        if (!Array.isArray(userVector)) {
            console.log(`[VerifyFace] User vector is NOT array:`, userVector);
            return null;
        }

        const similarity = this.cosineSimilarity(vector, userVector as number[]);
        console.log(`[VerifyFace] User ${closestUser.id} similarity: ${similarity}`);
        
        const threshold = 0.5; // Threshold for match
        if (similarity >= threshold) {
            return { user: closestUser, similarity };
        }

        return null;
    }

    private async extractVector(imageBuffer: Buffer, filename: string): Promise<number[] | null> {
        const form = new FormData();
        form.append('file', imageBuffer, { filename });

        try {
            const response = await axios.post(`${this.faceServiceUrl}/extract-vector`, form, {
                headers: {
                    ...form.getHeaders(),
                },
            });
            return response.data;
        } catch (error) {
            console.error('Face Service Error:', error.message);
            throw new HttpException('Failed to process face image', HttpStatus.BAD_GATEWAY);
        }
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
        const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
        const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
        return dotProduct / (normA * normB);
    }
}
