import { chunkArray } from '@back/util/misc';
import { SourceData } from '@database/entity/SourceData';
import { getManager } from 'typeorm';

export function findBySource(sourceId: number): Promise<SourceData[]> {
  const sourceDataRepository = getManager().getRepository(SourceData);
  return sourceDataRepository.find({
    where: {
      sourceId
    }
  });
}

export async function findSourceHash(sourceId: number, hash: string): Promise<SourceData | undefined> {
  const sourceDataRepository = getManager().getRepository(SourceData);
  const result = await sourceDataRepository.findOne({
    where: {
      sourceId,
      sha256: hash
    }
  });
  return result === null ? undefined : result;
}

export async function findOne(sourceDataId: number): Promise<SourceData | undefined> {
  const sourceDataRepository = getManager().getRepository(SourceData);
  const result = await sourceDataRepository.findOne({where: {id: sourceDataId }});
  return result === null ? undefined : result;
}

export function save(sourceData: SourceData): Promise<SourceData> {
  const sourceDataRepository = getManager().getRepository(SourceData);
  return sourceDataRepository.save(sourceData);
}

export function countBySource(sourceId: number): Promise<number> {
  const sourceDataRepository = getManager().getRepository(SourceData);
  return sourceDataRepository.count({
    where: {
      sourceId
    }
  });
}

export async function clearSource(sourceId: number): Promise<void> {
  const sourceDataRepository = getManager().getRepository(SourceData);
  await sourceDataRepository.delete({ sourceId });
}

export async function updateData(sourceData: SourceData[]): Promise<void> {
  const chunks = chunkArray(sourceData, 2000);
  for (const chunk of chunks) {
    await getManager().transaction(async transEntityManager => {
      for (const sd of chunk) {
        await transEntityManager.save(SourceData, sd);
      }
    });
  }
}
