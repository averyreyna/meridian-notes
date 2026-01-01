import { featureRegistry } from '../registry';
import * as computed from './computed';
import * as properties from './properties';
import * as rollups from './rollups';

// Register all features
Object.values(computed).forEach(f => featureRegistry.register(f));
Object.values(properties).forEach(f => featureRegistry.register(f));
Object.values(rollups).forEach(f => featureRegistry.register(f));

