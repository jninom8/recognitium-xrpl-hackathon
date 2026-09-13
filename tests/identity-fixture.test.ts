import test from 'node:test';
import assert from 'node:assert/strict';
import {identityFixture,assertIdentityBinding,previewIdentityFixture} from '../src/shared/identity-fixture.js';
import {canonical,digest} from '../src/shared/canonical.js';

test('synthetic identity binds request, wallet and profile; changes cannot reuse its commitment',()=>{
 const fixture=previewIdentityFixture();
 const {requestId,wallet}=fixture.opening;
 const reference={commitment:fixture.commitment,wallet,synthetic:true as const};
 const document=Buffer.from(canonical({identity:fixture}));
 assert.doesNotThrow(()=>assertIdentityBinding(reference,document,requestId,wallet));
 assert.throws(()=>assertIdentityBinding(reference,document,'other-request',wallet));
 assert.throws(()=>assertIdentityBinding(reference,document,requestId,'other-wallet'));
 const changed=structuredClone(fixture);changed.opening.profile.subject='Changed fictional subject';
 assert.throws(()=>assertIdentityBinding(reference,Buffer.from(canonical({identity:changed})),requestId,wallet));
 assert.notEqual(digest({identity:reference}),digest({identity:{...reference,wallet:'other-wallet'}}));
 assert.notEqual(identityFixture(requestId,wallet).commitment,identityFixture(requestId,wallet).commitment);
});
