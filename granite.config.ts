import { router } from '@granite-js/plugin-router';
import { hermes } from '@granite-js/plugin-hermes';
import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

// TODO: 임시 아이콘. `ait build`가 이 설정 파일을 .granite/ 아래로 복사해 별도 컨텍스트에서
// 재실행하므로 상대경로 import(예: src/data/characterImages)가 깨진다 — 그래서 여기서는
// 외부 모듈을 import하지 않고 base64를 직접 인라인한다(src/data/characterImages.ts의
// ANCHOR_B64와 동일한 값). 실제 출시 전엔 600x600 PNG를 호스팅한 URL로 교체해야 한다
// (모서리 둥근 형태/투명 배경 불가 — 콘솔 등록 가이드).
const ANCHOR_ICON_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAJAAAACQCAMAAADQmBKKAAAAwFBMVEX///////7//v7+/v7+/f39/f79/f39/fz8/f39/P39/Pz8' +
  '/P38/Pz8/Pv8+/v7+/v7+vr6+vr6+vn6+fn5+fn5+Pj4+Pjy8vLk5OTU1NTBwcG5ubm4uLi0tLSenp6EhYRxZmZTVFQ5OjolJSVO' +
  'IiIhISEgISAgICEgICAgIB8fIB/ZHSFnFRcfHyAfHx8fHx4fHh4eHx4eHh8eHh4eHh0eHR0dHR0aGhoWFhUQEA8LDAwHBwcFAwIB' +
  'AQEAAgEAAACPWfi5AAATuElEQVR42u1cC3ujxpLtDYo0Ih1jYq4AyeIZZkFxQFo0iJeW//+v7qlu9LIlWfbYk9lHfxM/MDTVVadO' +
  'nWpQ2PC1Mej/+0GD/djb3WbQ8P8NerNBnxHEwVsMUj79Pu/w0GdD+8tPiaHB5xs0+j+SZe8BkPqhblVf9dA5G8c/GTGOf0CZ+ccw' +
  'pN5o0OAnAfVtg3+2NeNPCNnoO4y52UM3J9fgwhXqzwbqTzCIfyRBjg4ufH7xgH0YGj/ogn/KoP8RxXXwAwwaXXfq4H9V16H+iKTv' +
  'DfrkAqa+y0Pvl6Jc03UD40HX+OeHTL2e1Fw3NHY0+IPO/4m072Os62TExJrOHdd1nJlt0u+apt5KVuMPzTJ9yJg5dYOq24829OYw' +
  'aqC/Xwiw9zajmsLY1IMxhe86UxtjOne9sOsaf8aYop8H9G+fxdRcY4oTdJ3v2OxkWI7fdKHD2T0/j0f1UwwCkGdBt3EtRs4wdF3D' +
  'QK7pKg6YTtiF8JL2rg771CDlNjTqzPS60pngps9S/QsnoHOn7DyTHSNpPL4RSzcrxsOEis7skG7IjLMpzg2FDA5t9vCBaX8F2A9s' +
  '3laPMOfLRVaGlx6r5vE2i8bvF2iqvNm8C60L3tmdxw1mhd38JGqnqvNC3G4xSD1Zis4eu8B8fe0GM4Nuyu53k4zf2SheBPJ4l192' +
  'HQKvg8un8h3yrbCylLsLblG/L+139+R8grsw/dqp/MvOIrsJlKMsJC+NX6PHN/LQPXOBDGNwE0gN5nTOkfHj78myvV/Fqsb7emFv' +
  'fWbcXO1YUJnK7eVfec0g9SVD+4011G43yO7cq/H9zpAB0Z0nbsDl+J2+nAD6aMgFvMlFbzVIZ14j8kY5Kqcn5ea4ztIFyhQoupGw' +
  'R282iDOz9kXN1KzDOEKUqphHf6ArFG3jM+07PTS4pKuIox+hdP5gThnFm6osyzQsvQNIFC3YRDGOV0W8KIkVH+BTk/EPy7IXEatp' +
  '9gfmBpY1hUJ0LMvzWV/xuTbkIR3pUFgtK3qEpcTr08uwHr1q0HX5pIQBrRbY3qDWz30HSAkd5Y4xXSfZ8S/meUwxXR+qbVqYQNcd' +
  's7buMU+Mv8tD6skifld2kyN5/B65boSiNTXoR9PWmIUSL8ZkI/Ods9BX3pD4b6n2OpsSS4vkNkPyArO8ysYX153hH76ZzGlIt7Fp' +
  '6A80ydZ+zPZ1/rePxBCsCGpL0SQhmf4m8IMygIh15swJHAeCzJ0pMCX28Qe3t0JH+fD6PFOfaUf+ukGDK5VJY95O4IwRCWY7Lil8' +
  'g01di8T11ME3qEllih7NIqxxeZkLtr6/uAk3eq9BFDBkOFapfhEtK5NNIeVeFTg2GrRmDlfokhz3DSy/Z37bO/b1pmNwe8g0JShN' +
  'rh3wrqGdFyQ5tOvADXy3DkyqF+iujeN+Whtajd9n/nhvkvq9GLofWp17vs7fQfODAHzfYOeiMjCIHLl+4x4qu61RRSC8ra1oZ6P5' +
  'AF5y/UBTtAu+pWCDPm/qqm/ykMbZxOlam2m/nuVLUqs+G/5+nvbAo21HsKdAjl/rzG4waAT8ohltqG6f7yQHtCVzUWUYioOLa89m' +
  'Ry4cqxdA/rpBd0NmB13bbtrgPy5u/twN97ro+epVgwW4uO4ad3LA9o6NRm82SGe/uW23KbfxBqieXKTNi+VnAmoso64K6y64oZll' +
  'r9pjBV0dRW0dfa1bh91pN20ZHAB0z5xtE8d1E0WbrnbYa9t+7DV7ZptuE30tu81ilQKb7JrEH51pu0HU2w0ZU0ZR1GACzq9qd/aK' +
  'PU7bpkkR122c5nHZdj6KgnYToRB5cfLvtorSOG3rsMiiCgRwcs3bQK1jeQhXXuRtFWX5OqraqnGeUYqYdDevenQDDbnnNEHQxVgM' +
  'Ls3zfBGVnc+59s6QGbAHq8vgmm4T52maFZ3vtsFU1LBrjdMABQTmTIPOdZoNTUExi1MYBouUazhi17ZdHNiDddHysmWapkVWdnPL' +
  '70gL8YcrSplTiZ3SiVZdh7AnS1M4Oc9WGSzymM5vMmj8LF5zxGuV5auEcixNkzQvwroyaeEBCUP9/Lxcv8cfH3ESXBlscWVGXq5b' +
  'eAo/wSK3z371LR4C4VcNJoObE3L3OqWQZRmVJSx+G4oNRs04dT/XxEa65YbCHMQ8T5bknzwptxssaY3oVScd/40GkUrt4gTpkWZx' +
  '1WXAJUZRxOV2OoRItb2q8R25UQ65IYYhd/VNx28qj7Qbt5Fh63VOnokKJD4mWRd5VDf2xWaNXW55ugIOQoakUbltqyKi6Yo0bMOJ' +
  'TglkOkHTBK7cvd+Nie0GdePT7rmmG1+CljCIGaKiasmgRZqv8jzehibnbzKIAFRSwJIkXq2jom67pswpf+MCDp8MNV36otzWgec6' +
  'j9Pp3HG8oGpL6TdoN6oZ3xKEOkrLptvWmySPAaM0XQED3vOg7QiDXahMVtlEebpaposFzPoa5XJOLDiqS5QkPryjxGbchhndtm1R' +
  'frvAc+y7Hu3QuNMKuZBEm4pWk4VxHv9nFGcEKMDoeft43SAK2DcsJl+vkgRLgtupd8bE6/UaOeewoZDtuk7bDn75lxilaNZgDRdP' +
  'HpymjQjC2xYLiWLKjziOE5owjdrQ4PzmkGFxQCMx4SpBmDJk/BI2hWXXSG7rPK2vaXzCvPavfrQem3CRzQab+J1AMUi1jiglyBrK' +
  'EkyYpODJQ6bxI94ZsWP2OWyUEX3keUJziKWtiB4xNX6Js3S7CdGF6bSf+Qeq3V/70cq7cHBGFEZbMmT9FTBLyCA5G1kVx6uoKc3h' +
  'uTLLLiE6Lgq5qJgIUdB1V5Fx4LhN43gt1TSxmfB0MKgENB5o29zZeqgZSCmshWRHsqR8zWIRujjJ8qQ4v7c2Zi8l/ogPpYNSiehF' +
  'mvf2UI4sv63zsCkUp/ZNNoFcdjd7i54WLhhmgrYWJThqwhwUFKfgLlwqLOqdRBOGcNE51cvOaiDBzDHxGfyTLbOMhEMZ0YKFt1Kk' +
  'rR2Uc2ZVHnPbo4h5pcnm1GG7XSwoCBWwQLBxsfARTBL4JvpwX+hHftagO+Z34Nc14p/HMkhIMjIIC05R3PJiUcETsMQLfDYZBL2L' +
  'ngJ4Jwi8BjLOrqsIwKMcFwZV0qBFQl5KqC5Sop1BEXuh9wDIpoqAIHB+kcULojLSDzXchkkRxHz9LerQjKJBDAwklN1IexpbMYaT' +
  'IKSo0ZpAyllvT41KT96OKekTSQGb589CDgaNjxuTB3g7SoHoXPwTIyYBUUPLCpehHonZ6HkZmlXIuPbPsvyzBUoHX37hKCAU9GS9' +
  'WmaEPpxbx2vU+ZQWBy/tXNT5lww6CaMyiVDlydkUH2kQlek8arZSpgmMN+FkrA8JlvfDafuE0U5pB5v/8qvOjbAJ5QRk+7ZZULDp' +
  'wCqlpAc5AutRXVvsbk84XH5n5yFNUUqTtB8AN4gxy5ttQdWf6mO6FmnLhbD0BFU/eXI3SyXlS6HJ89WySIttk1FaZcLCZJkIIiJB' +
  'QlXROJVhZwx6QNVAxcJtU2mWsIi+I4JNSwqAVgt9vdu9GqqhQPVTuKNVC0UsI57HJEXbEByLXC4QDJQKBxHzn8ZM9o7sZcTCJlqD' +
  'gbKlQBBFnjQDBSrB7DmiloDZ/osgcN8ngcyyXuVohOilWAjW0LZFXqyEc/YeTxb4GXkCKjraMFHVl0ytYrap4IwkXuQ9j5B7BcCB' +
  'T1iUiUM5FSmRJWgFKmlQJfZrZMzz3gBEOVkvqU6v0r3D5ci/bs5sGbMznQZNJMMMLK7ELLnwEBYFRMDfPdeGE1Rszo54iIsnak1I' +
  'JsC1icyDbLe2dG8UggnBf2bLaW/Qr/vnPR3FPwGhJpRrGYExI4ojXBYJciaSiE1zwjV6wWbH1BW6SEK0RAscWaNpLSgh1t9kegpc' +
  'xvTnJa6H8H4hZdmzHShlkqEGUbqLy7AyeGm57rMddUCwSrYQXEl8PVGcg0HQkgrR6lIqVdgjPJ0QI2ZFUQgEUEFDDYGPomZzAFGv' +
  '0NjLzaVS6uAs6dcEV0kY5TmguqbiHUvfR9tA+RfzD8XVZ/h1G4kgZcTt0aZu5NjA76j1tDQUkAUYEplabg9q//yrp6Q8iijtsUxW' +
  'xFVdlZucJpNIKL6K4p3vZJZZ7tXHE7LG6TaC5gtRa4qiFqOqNsWmrOA8itWCZl9kBQqs2IkfnQ3ZaIdp6ddENj4wqN3Sizg1rIqj' +
  'hG5FckJQNpxQmrNjgTY1S1AQPJkn5B8UmSiCVMthCyZB8yIaB8n9+Tp9hmq1N0g9OE3Q4hpdWI+gVb5Cp4C1oe0gowocL3JZLXOA' +
  'Neo8788jgebhcnTdy1zKFeoui5Ku3Tbk5zgm5Ug6NomFhoCM+eNYq6onBomQIcmojiVCRhP7ZAtcHZFVNDEcFcFHpB7XS7Rp0KdH' +
  'ivGpaUshg8ietEhjWLMV3l3AUwTwVU6146tIYTLIP30F4EXINBZ0pO5Bi3vSoMqVrdfx1zinxqMtwzAWCidCukTNUcQQsxo3jqR6' +
  'wihxekWOScgfspgJBEGkUdZS8dCuEiPvDRLalS7HJEtRFiHL8mUcFZsaYGjKpMSdSmA1aU48tEEOVCX6xVygBkGOSBLlwjGkpWOi' +
  'toUARCaIiL/E0LGeZsE2lCxP2FsQlPYcS405EsP3fDRENJqaorhX+U9PwAo94KQs6KoQJ1LKQejlPfX3Pqd+huZbR8SM6glozngo' +
  'FFqIBB7JReLpTEoHYlyKOkZQ+e7ctizLnrl+1ZJJT+1/B3TMNOXBgM4DIgsKVpYR9aex5PAkX/wtxO3OoPFFgySGFmJBcb8owYdE' +
  'rCmJqsjkJsrp8atnlltXfzWNd/I6mo1Si1PDmiwi/SpbKhKNUsLCyD2GLntIZBlSbBF/xTV/CxWcCQ8lyA8QTyeqA6r0xNC1O65p' +
  'uvHA6F2hgHbVcIxzcXAC1WArtN8QQwsJMSTUPb6KrBfFMA4778BD43MGGUJQE3hoVyATP1A3LiOXCweJJ67G8Zom1saDktZOZ/Jp' +
  '9SYuKXoMxpQiohVORDOcRvHLcs9evj5VRJlcgzCMkrtXDAk0ngsFbzX0XGi8e8FpXgLigWuxk/7qHlXWwskuMCn0cCx4XrSLVDlI' +
  'PfSNh3pMPc889DuzatlCUaDhHkE2sIXmSpNiO0UY3ONc5YrtOg5A3Lh814mKwo38gPXKtBOaSu59ZBLTwqBlLmU+vy7QNNqm7BmM' +
  'kiImB8GwhWynIRdwhqsYL973mDitv9tvVKX2h+H3qL208RXLvbiE+jLhLaocebT1r+uh/iWkTd/YR2JLL5GTURkJG2QpbnEqPLnx' +
  '8GDoCrNlE7HDJ6RsOSHzm1DSGm0ORiJxE5o0L862ii9EPmAIhZbLNSWZTI1FIviMsnTC7NI68yyTNopO9B+iX8oeNkylswkAREaS' +
  'btHRtuHk9UZR7sUIHJJsJasSUfxRGClLJ2z+jZ97jjfR3M3xXgpnk2KG0z1CNSRmvzUELgEAYtqCqLrZ/i2+/ZNWxp8P2s6jkg1x' +
  'mO88JVjk71Qa5ITs+TY7Uc8DC4KTAChKPJcGZf12nthskGDKi35L//lgZ4bmQztIeQYCWC5jCYE47z0UvnCrfA0EdHn0CgNXtIOH' +
  'envwFa76W7AiPfQ4d3fz3PDbKhZPOcRy+qqY9AZNN+Yphn4DM9pOAExrR0qGHzAkACDrEHUyKIlxXLb+2Vuz9syoSWJUab/lkO+a' +
  'qTxsERRmVbZ8XXLci2FQN4q+Pz1NYU2ZloIkGrk0UnwZbS4VeZyQWmiac/dm3oXhQ8xsSOaJjQLat6Ad1dLUJlroKhN6iYlQNBpx' +
  '7V637XltoHbsXpFTuaajBAdAulUBkLR1lRdriN4siaK8ArNfui+7OKZ+RUpsScovkk89VhGIg56Z92+9Actc4sD0t7LWD+iYxBRf' +
  '0wtPc+o7Rfst5H62waxbf375vrphPBhi/GEcD028zi6EGOnzYp0Kwbrx3PmsDtyZbfYJMbGmrk/PnQN3ahm7Y7bjBiW9pb9BF5Ik' +
  '2Vp0QTQbLhbC4PmQHw4x2MUXLeTTDNws2DSHzyWEIaZtK4AMDWUYBGFR0z0c03SCGnqxCIMQx6AZk5JODMPDtc0mgKwTT7UuP8G7' +
  '9oiTy89tMJM+uOG4NOYTZli2bZr23HEBNN+Dx3YPhEybjmHgvKmFX21rwsy5uNJxSEzKUBq3PXMdnHuCynVDP+GqX84yFz3fOP0I' +
  'DBAm735yjKbTvv+VL/VO03eB5kN+B9hyrcce/tt/ToDvT8MxbUzw5uJ1IgkR/HrDx5aY3o97/ecY7Kcbs9nscTbrvz7uv9Cv+EEe' +
  'mM32Z+x+kX96fBRf+7OPr5Z/Feftju2+7abuDz3ubiN/Y91PNtjj62P2+Pius2az2+fZn/vzYUj/yQa7wouvvaE/vumsFyeMPu4V' +
  '+PePWz+6zH+IQfJB9Y2fLmXXYzS+cX3ja2+A8bd80JVdec9x9BZAvWYuv+EVsVMP/frmNwI/AUE3VvuPsYLfdIO3gfqNpqkHu665' +
  'eTy6xSD13EL7V2tHN8RhdPhh/Gwp6nfx0Fh9EyTGL247OnmbcP/sZ/xOg/iLFanjm2EzPv1hfMHvn8jU4/FFEKtv4aGPT7H3D/Zq' +
  'Uf3yMck32jtNvXrRG0Kmjl+16eIZQLX6+iRX32N88fqt3Eg4938o+PUmf6pHlDG6TEzsiL/EyXKzCZeIX0aqKj6rgdH/IDc3xLsa' +
  'fFfHR5zvyI2P6BQVl5Hu4SP5q7h+OPxtv0+mqny/f6zKM2geXPVvWL01z9Hk/ZAAAAAASUVORK5CYII=';

export default defineConfig({
  appName: 'pettynews',
  scheme: 'granite',
  plugins: [
    router(),
    hermes(),
    appsInToss({
      // target 미지정 시 기본값 0.72.6 호환 레이어가 켜지는데, 그 코드도 Windows에서
      // 백슬래시 경로를 이스케이프 없이 require()에 꽂아 빌드가 깨진다. 실제 설치된
      // react-native 버전(0.84.0)을 명시해 그 호환 레이어 자체를 건너뛴다.
      target: '0.84.0',
      brand: {
        displayName: '보도블록',
        primaryColor: '#F04452',
        icon: `data:image/png;base64,${ANCHOR_ICON_B64}`,
      },
      permissions: [],
    }),
  ],
});
