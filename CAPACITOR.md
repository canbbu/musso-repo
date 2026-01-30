# Capacitor 앱 & 홈화면 추가 가이드

## 홈화면에 추가하는 방법 (웹 앱)

사이트를 **앱처럼** 쓰려면 브라우저에서 “홈화면에 추가”하면 됩니다.  
(스토어 설치 없이, 지금 배포된 웹 주소로 추가하는 방식입니다.)

### Android (Chrome)

1. **Chrome**으로 해당 사이트 접속
2. 주소창 오른쪽 **⋮** (메뉴) 탭
3. **“앱 설치”** 또는 **“홈 화면에 추가”** 선택
4. 확인하면 홈화면에 아이콘이 생김 → 탭하면 브라우저 없이 풀스크린으로 실행

### iPhone / iPad (Safari)

1. **Safari**로 해당 사이트 접속  
   (반드시 Safari. Chrome에서는 “홈화면 추가”가 제한될 수 있음)
2. 하단 **공유** 버튼(□↑) 탭
3. 목록에서 **“홈 화면에 추가”** 선택
4. 이름 확인 후 오른쪽 위 **“추가”** 탭
5. 홈화면에 아이콘 생성됨 → 탭하면 앱처럼 풀스크린으로 실행

### 요약

| 기기     | 브라우저 | 메뉴 위치                    |
|----------|----------|-----------------------------|
| Android  | Chrome   | ⋮ → 앱 설치 / 홈 화면에 추가 |
| iPhone   | Safari   | 공유(□↑) → 홈 화면에 추가    |

이미 `index.html`에 `apple-mobile-web-app-capable`, `viewport` 등이 있으면, 홈화면에서 실행 시 주소창 없이 더 깔끔하게 보입니다.

### 홈화면 아이콘 이미지 설정

홈화면에 뜨는 **아이콘**은 아래 두 곳에서 정합니다.

| 용도 | 파일 | 설명 |
|------|------|------|
| **Android / PWA** | `public/manifest.json` | `icons` 배열의 `src` 경로. 192×192, 512×512 권장. |
| **iPhone (Safari)** | `index.html` | `<link rel="apple-touch-icon" href="...">` 한 줄. 180×180 권장. |

**지금 설정:** `public/images/무쏘_누끼.jpg`와(폴백) `public/icon.png`(우선)를 사용합니다.

### 홈화면 아이콘이 안 나올 때 (사이즈·경로 문제)

핸드폰에서 “홈화면에 추가”해도 **아이콘이 비어 있거나 기본 아이콘만** 나오는 경우, 아래를 확인하세요.

| 원인 | 설명 |
|------|------|
| **사이즈** | iOS는 **180×180 픽셀** 정사각형을 권장합니다. 너무 작거나 비정사각이면 아이콘이 안 나오거나 깨져 보일 수 있습니다. |
| **파일명** | **한글 경로**(`/images/무쏘_누끼.jpg`)는 일부 서버·기기에서 인코딩 문제로 로드되지 않을 수 있습니다. **영어 파일명**(예: `icon.png`)을 쓰면 더 안정적입니다. |
| **형식** | 아이콘은 **PNG**가 JPG보다 호환성이 좋습니다. |

**권장 해결 방법**

1. **`public/icon.png` 추가**  
   - `public/images/무쏘_누끼.jpg`를 **180×180 정사각형 PNG**로 리사이즈해  
   - `public/icon.png`로 저장합니다.  
   - (포토샵, Figma, [Photopea](https://www.photopea.com), [resizeimage.net](https://resizeimage.net) 등 사용)

2. **배포**  
   - `public/icon.png`를 포함해 다시 배포합니다.

3. **다시 “홈화면에 추가”**  
   - 이미 추가해 둔 사용자는 **기존 홈화면 아이콘 삭제** 후, 사이트에 다시 들어가 **“홈화면에 추가”**를 한 번 더 하면 새 아이콘이 적용됩니다.

`index.html`과 `manifest.json`에는 이미 `/icon.png` 경로가 들어가 있으므로, **`public/icon.png`만 추가**하면 됩니다.

**아이콘 바꾸는 방법**

1. **이미지 준비**  
   - 정사각형 PNG 권장 (예: 192×192, 512×512).  
   - `public/images/` 아래에 넣거나, 예: `public/icon-192.png`, `public/icon-512.png` 로 두면 됩니다.

2. **manifest.json**  
   - `public/manifest.json` 안 `icons` 배열의 `src`를 새 파일 경로로 수정  
   - 예: `"src": "/icon-192.png"`, `"src": "/icon-512.png"`

3. **index.html (iPhone용)**  
   - `<link rel="apple-touch-icon" sizes="180x180" href="...">` 의 `href`를 새 이미지 경로로 수정  
   - 예: `href="/icon.png"` (기본값). `/icon.png`를 쓰려면 `public/icon.png` 파일이 있어야 합니다.

4. **배포 후**  
   - 변경 사항 배포한 뒤, 이미 홈화면에 추가한 사용자는 **기존 아이콘 삭제 후 다시 “홈화면에 추가”** 해야 새 아이콘이 보입니다.

---

## Capacitor (앱 스토어 배포)

이 프로젝트는 **Capacitor**로 iOS·Android **앱 스토어** 배포가 가능합니다.

### 준비

- **Android**: [Android Studio](https://developer.android.com/studio) 설치
- **iOS**: Mac + [Xcode](https://developer.apple.com/xcode/) + CocoaPods

### 웹 수정 후 앱에 반영

```bash
npm run cap:sync
```

### Android (Google Play)

1. `npm run cap:open:android` → Android Studio에서 빌드·서명
2. AAB 생성 후 [Play Console](https://play.google.com/console)에 업로드

### iOS (App Store)

1. Mac에서 `cd ios/App && pod install`
2. `npm run cap:open:ios` → Xcode에서 서명·아카이브
3. App Store Connect에 업로드

### 설정

- **capacitor.config.ts**: `appId`, `appName`, `webDir: 'dist'`
- **vite.config.ts**: `base: './'` (앱/홈화면에서 정상 로드용)
