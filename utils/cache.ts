import AsyncStorage from '@react-native-async-storage/async-storage';

// 캐시 만료 시간 (1주일)
export const CACHE_EXPIRE_MS = 1000 * 60 * 60 * 24 * 7;

// 캐시 데이터 구조
export interface CacheData<T> {
  timestamp: number;
  data: T;
}

/**
 * 캐시 데이터 저장
 * @param key 캐시 키
 * @param data 저장할 데이터
 */
export const saveCache = async <T>(key: string, data: T): Promise<void> => {
  try {
    const cacheData: CacheData<T> = {
      timestamp: Date.now(),
      data
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error saving cache:', error);
  }
};

/**
 * 캐시 데이터 불러오기
 * @param key 캐시 키
 * @returns 캐시된 데이터 또는 null
 */
export const loadCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cache = await AsyncStorage.getItem(key);
    if (cache) {
      const cacheData: CacheData<T> = JSON.parse(cache);
      if (cacheData.timestamp && Date.now() - cacheData.timestamp < CACHE_EXPIRE_MS) {
        return cacheData.data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error loading cache:', error);
    return null;
  }
};

/**
 * 캐시 데이터 삭제
 * @param key 캐시 키
 */
export const removeCache = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing cache:', error);
  }
};

/**
 * 여러 캐시 데이터 한번에 불러오기
 * @param keys 캐시 키 배열
 * @returns 캐시된 데이터 객체
 */
export const loadMultipleCache = async <T>(keys: string[]): Promise<{ [key: string]: T | null }> => {
  try {
    const cacheValues = await Promise.all(keys.map(key => AsyncStorage.getItem(key)));
    const result: { [key: string]: T | null } = {};
    
    keys.forEach((key, index) => {
      const cache = cacheValues[index];
      if (cache) {
        const cacheData: CacheData<T> = JSON.parse(cache);
        if (cacheData.timestamp && Date.now() - cacheData.timestamp < CACHE_EXPIRE_MS) {
          result[key] = cacheData.data;
        } else {
          result[key] = null;
        }
      } else {
        result[key] = null;
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error loading multiple cache:', error);
    return keys.reduce((acc, key) => ({ ...acc, [key]: null }), {});
  }
};

/**
 * 캐시 키 생성 (URL 기반)
 * @param prefix 캐시 키 접두사
 * @param url URL 문자열
 * @returns 생성된 캐시 키
 */
export const createCacheKey = (prefix: string, url: string): string => {
  return `${prefix}_${url.replace(/[^a-zA-Z0-9]/g, '_')}`;
}; 