/**
 * Oiiaioo Tycoon Pro - Logic (Updated)
 */

let state = JSON.parse(localStorage.getItem('oiiaioo_pro_v2')) || {
    money: 0,
    clickPower: 1,
    autoGold: 0,
    level: 1,
    exp: 0,
    hunger: 100,
    isSleeping: false,
    upgrades: {
        click: { lv: 0, baseCost: 100 },
        auto: { lv: 0, baseCost: 500 }
    }
};

const UI = {
    money: document.getElementById('total-money'),
    gps: document.getElementById('gps-val'),
    lv: document.getElementById('lv-num'),
    // 바 (그래픽)
    barExp: document.getElementById('bar-exp'),
    barHunger: document.getElementById('bar-hunger'),
    // 수치 (텍스트)
    valExp: document.getElementById('val-exp'),
    valHunger: document.getElementById('val-hunger'),
    
    petImg: document.getElementById('pet-img'),
    log: document.getElementById('game-log'),
    audio: document.getElementById('sfx-oiiaioo'),
    
    // 상점 수치
    upClickLv: document.getElementById('up-click-lv'),
    upClickCost: document.getElementById('up-click-cost'),
    upAutoLv: document.getElementById('up-auto-lv'),
    upAutoCost: document.getElementById('up-auto-cost'),
    clickPowerVal: document.getElementById('click-power-val'),
    btnSleep: document.getElementById('btn-sleep')
};

// 1. 초기 UI 업데이트
function updateUI() {
    // 돈과 레벨
    UI.money.innerText = Math.floor(state.money).toLocaleString();
    UI.gps.innerText = state.autoGold;
    UI.lv.innerText = state.level;
    UI.clickPowerVal.innerText = state.clickPower;

    //험치 및 배고픔 수치 텍스트 업데이트 (피드백 반영)
    UI.valExp.innerText = Math.floor(state.exp);
    UI.valHunger.innerText = Math.floor(state.hunger);

    // 게이지 바 업데이트
    UI.barExp.style.width = `${state.exp}%`;
    UI.barHunger.style.width = `${state.hunger}%`;

    // 상점 업그레이드 정보
    UI.upClickLv.innerText = state.upgrades.click.lv;
    UI.upClickCost.innerText = getCost('click');
    UI.upAutoLv.innerText = state.upgrades.auto.lv;
    UI.upAutoCost.innerText = getCost('auto');

    // [중요] 펫 이미지 상태 변화 로직 (이미지 확인용)
    if (state.isSleeping) {
        UI.petImg.src = "images/pet-sleep.png";
        UI.btnSleep.innerText = "☀️ 일어나기";
    } else if (state.hunger < 30) {
        // 배고픔이 30 미만일 때 pet-sad.png 출력
        UI.petImg.src = "images/pet-sad.png";
        UI.btnSleep.innerText = "💤 잠자기";
    } else {
        UI.petImg.src = "images/pet-idle.gif";
        UI.btnSleep.innerText = "💤 잠자기";
    }
}

function getCost(type) {
    const up = state.upgrades[type];
    return Math.floor(up.baseCost * Math.pow(1.6, up.lv));
}

// 2. 클릭 이벤트
function handlePetClick(e) {
    if (state.isSleeping) return showLog("잠자는 중에는 클릭할 수 없습니다!");
    
    state.money += state.clickPower;
    state.exp += 0.5; // 클릭당 경험치 0.5 증가

    // 클릭 효과
    const moneyPop = document.createElement('div');
    moneyPop.className = 'floating-money';
    moneyPop.innerText = `+${state.clickPower}G`;
    moneyPop.style.left = `${e.clientX - 20}px`;
    moneyPop.style.top = `${e.clientY - 40}px`;
    document.body.appendChild(moneyPop);
    setTimeout(() => moneyPop.remove(), 800);

    // 사운드
    UI.audio.currentTime = 0;
    UI.audio.play();

    checkLevelUp();
    updateUI();
    saveGame();
}

// 3. 상점 구매
function buyUpgrade(type) {
    const cost = getCost(type);
    if (state.money >= cost) {
        state.money -= cost;
        state.upgrades[type].lv++;
        
        if (type === 'click') state.clickPower += 2;
        else state.autoGold += 5;

        showLog("업그레이드 완료!");
        updateUI();
        saveGame();
    } else {
        showLog("돈이 부족합니다!");
    }
}

// 4. 자동 루프 (1초마다)
setInterval(() => {
    if (!state.isSleeping) {
        // 자동 골드 획득
        if (state.autoGold > 0) {
            state.money += state.autoGold;
        }
        // 배고픔 감소 (초당 0.3씩)
        state.hunger = Math.max(0, state.hunger - 0.3);
    } else {
        // 잠자는 동안 배고픔 아주 조금 감소 & 에너지 회복(여기선 생략)
        state.hunger = Math.max(0, state.hunger - 0.05);
    }
    updateUI();
    saveGame();
}, 1000);

// 5. 기타 기능
function interact(type) {
    if (type === 'feed') {
        if (state.money >= 50) {
            state.money -= 50;
            state.hunger = Math.min(100, state.hunger + 30);
            showLog("냠냠! 배고픔이 회복되었습니다. (-50G)");
        } else {
            showLog("돈이 부족합니다!");
        }
    } else if (type === 'sleep') {
        state.isSleeping = !state.isSleeping;
        showLog(state.isSleeping ? "고양이가 잠에 들었습니다." : "고양이가 일어났습니다!");
    }
    updateUI();
    saveGame();
}

function checkLevelUp() {
    if (state.exp >= 100) {
        state.level++;
        state.exp = 0;
        showLog(`🎊 축하합니다! 레벨 ${state.level} 달성!`);
    }
}

function switchTab(id, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function showLog(m) { UI.log.innerText = m; }
function saveGame() { localStorage.setItem('oiiaioo_pro_v2', JSON.stringify(state)); }

// 시작
updateUI();