import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,statSync} from 'node:fs';
import {VOICE_MESSAGE} from '../src/voice-message-config.js';
test('configured voice recording exists with its exact filename and is bundled for hosting',()=>{
 if(VOICE_MESSAGE===null)return;
 assert.equal(VOICE_MESSAGE,'Recording.m4a');
 const path=new URL(`../public/${VOICE_MESSAGE}`,import.meta.url);
 assert.ok(existsSync(path));assert.ok(statSync(path).size>0);
 assert.ok(statSync(path).size<100*1024*1024);
});
