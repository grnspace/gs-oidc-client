import {
  createRemoteJWKSet,
  jwtVerify,
} from 'https://cdnjs.cloudflare.com/ajax/libs/jose/4.14.4/index.bundle.min.js';

(function () {
  async function validateSignature(token) {
    const JWKS = createRemoteJWKSet(
      new URL('https://app.staging.grnspace.com/oauth2/jwks/')
    );
    const { payload, protectedHeader } = await jwtVerify(token, JWKS);
    console.log('Signature verified with key: ' + protectedHeader.kid);

    return payload;
  }

  var params = new Map(
    window.location.search
      .slice(1)
      .split('&')
      .map((str) => str.split('='))
  );

  var code = params.get('code');
  if (code) {
    var signInEl = document.getElementsByClassName('gs-signin')[0];
    var formData = new FormData();
    formData.append('code', code);
    formData.append('redirect_uri', signInEl.dataset.redirectUri);
    formData.append('grant_type', 'authorization_code');
    formData.append('client_id', signInEl.dataset.clientId);
    formData.append(
      'code_verifier',
      'U8GF5fVgvvXjWKJM3A8MtQlzoBY2_.jR.IBrW67Mc5hWLHTr7SN2SfnCuEGq0jffH0hMTCt8PB.CLco~H0qcJEno5AUgOGRuxdKpj1tQakBFt3kw3bM55ZMKh4tdH7uw'
    );

    var host = signInEl.dataset.host || 'https://app.staging.grnspace.com/';
    if (host[host.length - 1] !== '/') host += '/';
    fetch(host + 'oauth2/token', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => validateSignature(data.id_token))
      .then((claims) => {
        var resultEl = document.getElementById('id-token-result');
        resultEl.textContent = JSON.stringify(claims, null, 2);
        resultEl.style.display = '';
        hljs.highlightBlock(resultEl);
      })
      .catch((err) => {
        var resultEl = document.getElementById('id-token-result');
        resultEl.textContent = err.message;
        resultEl.style.display = '';
      });
  }
})();
