 // 손 카드 호버 초기값
        const handCards = document.querySelectorAll('.hand-cards .card');
        handCards.forEach((card, index) => {
            const positions = [
                { x: -140, y: 30, r: -12 },
                { x: -70, y: 8, r: -6 },
                { x: 0, y: 0, r: 0 },
                { x: 70, y: 8, r: 6 },
                { x: 140, y: 30, r: 12 }
            ];
            card.style.setProperty('--x', positions[index].x + 'px');
            card.style.setProperty('--y', positions[index].y + 'px');
            card.style.setProperty('--r', positions[index].r + 'deg');
        });

        const flashlight = document.getElementById('flashlight');
        const allCards = document.querySelectorAll('.card');
        const detailOverlay = document.getElementById('detailOverlay');
        const detailCard = document.getElementById('detailCard');
        const detailName = document.getElementById('detailName');
        const detailImage = document.getElementById('detailImage');
        const detailAtk = document.getElementById('detailAtk');
        const detailDef = document.getElementById('detailDef');
        const detailDesc = document.getElementById('detailDesc');
        const sideName = document.getElementById('sideName');
        const sideAtk = document.getElementById('sideAtk');
        const sideDef = document.getElementById('sideDef');
        const sideDesc = document.getElementById('sideDesc');


        document.addEventListener('mousemove', (e) => {
            const isDetailActive = detailOverlay.classList.contains('active');
            if (isDetailActive) {
                const rect = detailCard.getBoundingClientRect();
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                if (mouseX >= rect.left && mouseX <= rect.right &&
                    mouseY >= rect.top && mouseY <= rect.bottom) {
                    flashlight.style.left = mouseX + 'px';
                    flashlight.style.top = mouseY + 'px';
                    flashlight.style.opacity = '1';
                } else {
                    flashlight.style.opacity = '0';
                }
            } else {
                flashlight.style.left = e.clientX + 'px';
                flashlight.style.top = e.clientY + 'px';
                flashlight.style.opacity = '1';
            }
        });

        let selectedCard = null;
        let isDragging = false;
        let dragClone = null;

        const handCardElements = document.querySelectorAll('.hand-cards .card');
        const groundSlots = document.querySelectorAll('.card-slot');
        const graveyard = document.getElementById('graveyard');

        allCards.forEach(card => {
            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const name = card.dataset.name;
                const atk = card.dataset.atk;
                const def = card.dataset.def;
                const desc = card.dataset.desc;

                // 기존 디테일 카드 채우기
                detailName.textContent = name;
                detailAtk.textContent = `ATK/${atk}`;
                detailDef.textContent = `DEF/${def}`;
                detailDesc.textContent = desc;

                // 사이드 패널도 채우기
                sideName.textContent = name;
                sideAtk.textContent = `ATK ${atk}`;
                sideDef.textContent = `DEF ${def}`;
                sideDesc.textContent = desc;

                // 이미지 배경 유지
                const cardImage = card.querySelector('.card-image');
                const bgStyle = cardImage ? window.getComputedStyle(cardImage).background : '';
                if (bgStyle) detailImage.style.background = bgStyle;

                detailOverlay.classList.add('active');
                document.body.classList.add('detail-mode');
            });
        });


        function addDragEventToCard(card) {
            card.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                e.preventDefault();

                if (selectedCard === card) {
                    card.classList.remove('selected');
                    selectedCard = null;
                } else {
                    if (selectedCard) selectedCard.classList.remove('selected');
                    card.classList.add('selected');
                    selectedCard = card;

                    isDragging = true;
                    selectedCard.classList.add('drag-source');

                    // 드래그 클론
                    dragClone = card.cloneNode(true);
                    dragClone.classList.remove('selected');
                    dragClone.classList.add('dragging');
                    dragClone.style.position = 'fixed';
                    dragClone.style.width = '160px';
                    dragClone.style.height = '240px';
                    dragClone.style.pointerEvents = 'none';
                    dragClone.style.transform = 'translate(-50%, -50%)';
                    document.body.appendChild(dragClone);

                    updateDragClonePosition(e);
                }
            });
        }

        handCardElements.forEach(card => addDragEventToCard(card));

        function updateDragClonePosition(e) {
            if (dragClone) {
                dragClone.style.left = e.clientX + 'px';
                dragClone.style.top = e.clientY + 'px';
            }
        }

        document.addEventListener('mousemove', (e) => {
            if (isDragging && dragClone) {
                updateDragClonePosition(e);
                
                let overSlot = null;
                let overGraveyard = false;
                
                groundSlots.forEach(slot => {
                    const rect = slot.getBoundingClientRect();
                    if (e.clientX >= rect.left && e.clientX <= rect.right &&
                        e.clientY >= rect.top && e.clientY <= rect.bottom) {
                        overSlot = slot;
                    }
                });
                
                const graveyardRect = graveyard.getBoundingClientRect();
                if (e.clientX >= graveyardRect.left && e.clientX <= graveyardRect.right &&
                    e.clientY >= graveyardRect.top && e.clientY <= graveyardRect.bottom) {
                    overGraveyard = true;
                }
                
                groundSlots.forEach(slot => {
                    if (slot === overSlot && !slot.querySelector('.card')) {
                        slot.classList.add('drop-target');
                    } else {
                        slot.classList.remove('drop-target');
                    }
                });
                
                if (overGraveyard) {
                    graveyard.classList.add('drop-target');
                } else {
                    graveyard.classList.remove('drop-target');
                }
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (isDragging && selectedCard) {
                let targetSlot = null;
                let droppedInGraveyard = false;
                
                groundSlots.forEach(slot => {
                    const rect = slot.getBoundingClientRect();
                    if (e.clientX >= rect.left && e.clientX <= rect.right &&
                        e.clientY >= rect.top && e.clientY <= rect.bottom &&
                        !slot.querySelector('.card')) {
                        targetSlot = slot;
                    }
                });
                
                const graveyardRect = graveyard.getBoundingClientRect();
                if (e.clientX >= graveyardRect.left && e.clientX <= graveyardRect.right &&
                    e.clientY >= graveyardRect.top && e.clientY <= graveyardRect.bottom) {
                    droppedInGraveyard = true;
                }
                
                if (targetSlot) {
                    const movedCard = selectedCard.cloneNode(true);
                    movedCard.classList.remove('dragging', 'selected', 'drag-source');
                    movedCard.style.position = '';
                    movedCard.style.width = '';
                    movedCard.style.height = '';
                    movedCard.style.left = '';
                    movedCard.style.top = '';
                    movedCard.style.transform = '';

                    // 드롭 직후 오버레이 제거

                    targetSlot.appendChild(movedCard);
                    selectedCard.remove();

                    // 새 카드에도 드래그/우클릭 다시 붙이기
                    addDragEventToCard(movedCard);
                    movedCard.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const name = movedCard.dataset.name;
                        const atk = movedCard.dataset.atk;
                        const def = movedCard.dataset.def;
                        const desc = movedCard.dataset.desc;

                        const cardImage = movedCard.querySelector('.card-image');
                        const bgStyle = cardImage ? window.getComputedStyle(cardImage).background : '';

                        detailName.textContent = name;
                        detailAtk.textContent = `ATK/${atk}`;
                        detailDef.textContent = `DEF/${def}`;
                        detailDesc.textContent = desc;

                        if (bgStyle) detailImage.style.background = bgStyle;
                        detailOverlay.classList.add('active');
                    });
                } else if (droppedInGraveyard) {
                    selectedCard.remove();
                }
                
                if (dragClone) {
                    dragClone.remove();
                    dragClone = null;
                }
                if (selectedCard) {
                    selectedCard.classList.remove('selected');
                    selectedCard.classList.remove('drag-source');
                    selectedCard = null;
                }
                isDragging = false;
                
                groundSlots.forEach(slot => slot.classList.remove('drop-target'));
                graveyard.classList.remove('drop-target');
            }
        });

        detailOverlay.addEventListener('click', (e) => {
            if (e.target === detailOverlay) {
                detailOverlay.classList.remove('active');
                detailCard.classList.remove('flipped');
                document.body.classList.remove('detail-mode');
            }
        });

        detailCard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            detailCard.classList.toggle('flipped');
        });

        detailOverlay.addEventListener('mousemove', (e) => {
            const rect = detailCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            detailCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            detailCard.style.setProperty('--shine-x', `${x}px`);
            detailCard.style.setProperty('--shine-y', `${y}px`);
            const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
            detailCard.style.setProperty('--edge-angle', `${angle}deg`);
        });

        detailCard.addEventListener('click', (e) => {
            e.stopPropagation();
        });

                // 턴 시스템 변수
        let currentTurn = 1;
        let currentPhase = 'cleanup'; // 'cleanup' 또는 'meal'
        const maxTurns = 13;

        // 턴 UI 요소들
        const turnControl = document.getElementById('turnControl');
        const currentTurnElement = document.getElementById('currentTurn');
        const currentPhaseElement = document.getElementById('currentPhase');
        const nextPhaseBtn = document.getElementById('nextPhaseBtn');
        const gameOverOverlay = document.getElementById('gameOverOverlay');
        const restartBtn = document.getElementById('restartBtn');

        // 턴 시스템 초기화
        function initializeTurnSystem() {
            updateTurnUI();
            nextPhaseBtn.addEventListener('click', nextPhase);
            restartBtn.addEventListener('click', restartGame);
        }

        // 턴 UI 업데이트
        function updateTurnUI() {
            currentTurnElement.textContent = currentTurn;
            
            if (currentPhase === 'cleanup') {
                currentPhaseElement.textContent = '정리 시간';
                currentPhaseElement.className = 'turn-phase cleanup';
                nextPhaseBtn.textContent = '식사 시간으로';
            } else {
                currentPhaseElement.textContent = '식사 시간';
                currentPhaseElement.className = 'turn-phase meal';
                nextPhaseBtn.textContent = '다음 턴으로';
            }
        }

        // 다음 페이즈로 진행
        function nextPhase() {
            if (currentPhase === 'cleanup') {
                // 정리 시간 → 식사 시간
                currentPhase = 'meal';
                onMealPhaseStart();
            } else {
                // 식사 시간 → 다음 턴의 정리 시간
                currentTurn++;
                currentPhase = 'cleanup';
                
                if (currentTurn > maxTurns) {
                    endGame();
                    return;
                }
                
                onCleanupPhaseStart();
            }
            
            updateTurnUI();
        }

        // 정리 시간 시작 시 호출
        function onCleanupPhaseStart() {
            console.log(`턴 ${currentTurn} 정리 시간 시작`);
            // 여기에 정리 시간 로직 추가
        }

        // 식사 시간 시작 시 호출
        function onMealPhaseStart() {
            console.log(`턴 ${currentTurn} 식사 시간 시작`);
            // 여기에 식사 시간 로직 추가
        }

        // 게임 종료
        function endGame() {
            console.log('게임 종료!');
            gameOverOverlay.classList.add('active');
            document.body.classList.add('detail-mode'); // 백그라운드 블러 효과
        }

        // 게임 재시작
        function restartGame() {
            currentTurn = 1;
            currentPhase = 'cleanup';
            gameOverOverlay.classList.remove('active');
            document.body.classList.remove('detail-mode');
            updateTurnUI();
            
            // 게임 상태 초기화 로직 추가
            console.log('게임 재시작');
        }

        // 기존 코드 마지막에 추가
        initializeTurnSystem();

// VHS 효과 시스템
let vhsEnabled = true;
let vhsGlitchInterval;

// VHS 효과 초기화
function initVHSEffect() {
    // body에 VHS 모드 클래스 추가
    document.body.classList.add('vhs-mode');
    
    // 랜덤 글리치 효과
    vhsGlitchInterval = setInterval(() => {
        if (Math.random() < 0.05) { // 5% 확률로 글리치
            triggerVHSGlitch();
        }
    }, 1000);
    
    // 색상 분리 효과 (RGB 분리)
    addChromAberration();
}

// VHS 글리치 효과 트리거
function triggerVHSGlitch() {
    const body = document.body;
    body.classList.add('vhs-glitch');
    
    setTimeout(() => {
        body.classList.remove('vhs-glitch');
    }, 300);
}

// 강화된 색수차 효과
function addEnhancedChromAberration() {
    const style = document.createElement('style');
    style.textContent = `
        /* 전체 화면에도 색수차 적용 */
        body.vhs-mode::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: 
                radial-gradient(circle at 30% 50%, 
                    rgba(255, 0, 0, 0.1) 0%, 
                    transparent 50%),
                radial-gradient(circle at 70% 50%, 
                    rgba(0, 255, 255, 0.08) 0%, 
                    transparent 50%);
            pointer-events: none;
            z-index: 9998;
            animation: screen-aberration 0.2s infinite;
        }
        
        @keyframes screen-aberration {
            0% { 
                transform: translate(-1px, 0) scale(1.002); 
                filter: hue-rotate(0deg);
            }
            20% { 
                transform: translate(2px, -1px) scale(0.998); 
                filter: hue-rotate(5deg);
            }
            40% { 
                transform: translate(-2px, 1px) scale(1.001); 
                filter: hue-rotate(-3deg);
            }
            60% { 
                transform: translate(1px, -2px) scale(0.999); 
                filter: hue-rotate(7deg);
            }
            80% { 
                transform: translate(-1px, 2px) scale(1.003); 
                filter: hue-rotate(-2deg);
            }
            100% { 
                transform: translate(-1px, 0) scale(1.002); 
                filter: hue-rotate(0deg);
            }
        }
        
        /* 손전등에도 색수차 효과 */
        .flashlight {
            box-shadow: 
                0 0 200px 100px rgba(255, 255, 255, 0.1),
                0 0 300px 150px rgba(255, 0, 0, 0.05),
                0 0 400px 200px rgba(0, 255, 255, 0.03);
        }
        
        /* 카드 호버시 색수차 강화 */
        .card:hover .card-image::before {
            opacity: 0.6;
            transform: translate(-6px, -2px) scale(1.03);
        }
        
        .card:hover .card-image::after {
            opacity: 0.5;
            transform: translate(6px, 2px) scale(0.97);
        }
        
        /* 디테일 카드에 극강 색수차 */
        .detail-card .card-image::before {
            opacity: 0.7;
            animation: detail-chrom-red 0.1s infinite;
        }
        
        .detail-card .card-image::after {
            opacity: 0.6;
            animation: detail-chrom-cyan 0.08s infinite;
        }
        
        @keyframes detail-chrom-red {
            0% { transform: translate(-8px, -3px) scale(1.05); }
            50% { transform: translate(-12px, 0px) scale(1.08); }
            100% { transform: translate(-8px, -3px) scale(1.05); }
        }
        
        @keyframes detail-chrom-cyan {
            0% { transform: translate(8px, 3px) scale(0.95); }
            50% { transform: translate(12px, 0px) scale(0.92); }
            100% { transform: translate(8px, 3px) scale(0.95); }
        }
    `;
    document.head.appendChild(style);
}

// 기존 addChromAberration 함수 교체
function addChromAberration() {
    addEnhancedChromAberration();
}

// 글리치 시 색수차 폭발 효과
function triggerVHSGlitch() {
    const body = document.body;
    body.classList.add('vhs-glitch');
    
    // 글리치 중 색수차 극대화
    const glitchStyle = document.createElement('style');
    glitchStyle.id = 'glitch-chrom';
    glitchStyle.textContent = `
        .vhs-glitch .card-image::before {
            opacity: 0.9 !important;
            transform: translate(-15px, -5px) scale(1.1) !important;
            animation: glitch-chrom-red 0.05s infinite !important;
        }
        
        .vhs-glitch .card-image::after {
            opacity: 0.8 !important;
            transform: translate(15px, 5px) scale(0.9) !important;
            animation: glitch-chrom-cyan 0.03s infinite !important;
        }
        
        @keyframes glitch-chrom-red {
            0% { transform: translate(-20px, -8px) scale(1.15); }
            50% { transform: translate(-10px, -2px) scale(1.05); }
            100% { transform: translate(-20px, -8px) scale(1.15); }
        }
        
        @keyframes glitch-chrom-cyan {
            0% { transform: translate(20px, 8px) scale(0.85); }
            50% { transform: translate(10px, 2px) scale(0.95); }
            100% { transform: translate(20px, 8px) scale(0.85); }
        }
    `;
    document.head.appendChild(glitchStyle);
    
    setTimeout(() => {
        body.classList.remove('vhs-glitch');
        document.getElementById('glitch-chrom')?.remove();
    }, 300);
}

// VHS 노이즈 패턴 생성
function createVHSNoise() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = Math.random() * 255;
        imageData.data[i] = noise * 0.3;     // R
        imageData.data[i + 1] = noise * 0.2; // G
        imageData.data[i + 2] = noise * 0.4; // B
        imageData.data[i + 3] = 20;          // Alpha
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // 노이즈를 배경으로 추가
    const vhsOverlay = document.getElementById('vhsOverlay');
    if (vhsOverlay) {
        vhsOverlay.style.backgroundImage = `url(${canvas.toDataURL()})`;
        vhsOverlay.style.backgroundSize = '100px 100px';
        vhsOverlay.style.opacity = '0.03';
        vhsOverlay.style.animation = 'vhs-noise 0.1s infinite';
    }
}

// VHS 노이즈 애니메이션
const vhsNoiseStyle = document.createElement('style');
vhsNoiseStyle.textContent = `
    @keyframes vhs-noise {
        0% { background-position: 0 0; }
        10% { background-position: -5px -10px; }
        20% { background-position: -15px 5px; }
        30% { background-position: 7px -25px; }
        40% { background-position: -5px 25px; }
        50% { background-position: -15px 10px; }
        60% { background-position: 15px 0px; }
        70% { background-position: 0px 15px; }
        80% { background-position: 3px -10px; }
        90% { background-position: -10px 10px; }
        100% { background-position: 0 0; }
    }
`;
document.head.appendChild(vhsNoiseStyle);

// VHS 토글 함수 (필요시 사용)
function toggleVHS() {
    vhsEnabled = !vhsEnabled;
    
    if (vhsEnabled) {
        document.body.classList.add('vhs-mode');
        document.getElementById('vhsOverlay').style.display = 'block';
    } else {
        document.body.classList.remove('vhs-mode');
        document.getElementById('vhsOverlay').style.display = 'none';
    }
}

// 초기화 실행
document.addEventListener('DOMContentLoaded', () => {
    initVHSEffect();
    createVHSNoise();
});

// 기존 코드 마지막에 추가
initVHSEffect();