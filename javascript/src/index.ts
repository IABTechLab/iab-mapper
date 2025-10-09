/**
 * @mixpeek/iab-mapper
 * 
 * Local IAB Content Taxonomy 2.x -> 3.0 mapper with vectors, SCD, OpenRTB/VAST exporters
 * 
 * @example
 * ```typescript
 * import { Mapper } from '@mixpeek/iab-mapper';
 * 
 * const mapper = new Mapper({
 *   fuzzyMethod: 'rapidfuzz',
 *   fuzzyCut: 0.92,
 *   maxTopics: 3,
 *   cattax: '2'
 * });
 * 
 * const result = mapper.mapRecord({
 *   code: '2-12',
 *   label: 'Food & Drink',
 *   channel: 'editorial',
 *   type: 'article'
 * });
 * 
 * console.log(result.openrtb);
 * // { content: { cat: ['3-5-2', ...], cattax: '2' } }
 * ```
 */

export { Mapper, MapConfig, MappedRecord, InputRecord, TopicMatch, VectorValues } from './mapper';
export { normalize } from './normalize';
export { fuzzyMulti, TFIDFIndex } from './matching';

