import { CHARACTER_MODELS } from '../src/character-config.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {dirname,resolve} from 'node:path';

for (const name of ['girl','boy']) {
  test(`${name} model bundles its required resources`, () => {
    const path=resolve('public', CHARACTER_MODELS[name]);
    const data=readFileSync(path);
    assert.equal(data.readUInt32LE(0),0x46546c67);
    const json=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString());
    for(const resource of [...(json.images??[]),...(json.buffers??[])]) {
      if(resource.uri&&!resource.uri.startsWith('data:')) assert.ok(existsSync(resolve(dirname(path),resource.uri)),`Missing ${resource.uri}`);
    }
    const clips = new Set((json.animations ?? []).map(clip => clip.name));
    for (const clip of ['idle', 'walk', 'jump']) assert.ok(clips.has(clip), `Missing ${clip}`);
    assert.ok(json.meshes.length>0);
  });
}
