import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

// Cena, câmera, renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Luz
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(light);

// Modelo exemplo (pulmão)
const geometry = new THREE.SphereGeometry(0.5, 32, 32);
const material = new THREE.MeshStandardMaterial({ color: 0x00aaff, transparent: true, opacity: 0.8 });
const lung = new THREE.Mesh(geometry, material);
scene.add(lung);

// Painel do Chat
const chatCanvas = document.createElement('canvas');
chatCanvas.width = 512;
chatCanvas.height = 512;
const chatContext = chatCanvas.getContext('2d');
chatContext.fillStyle = "rgba(255,255,255,1)";
chatContext.fillRect(0, 0, chatCanvas.width, chatCanvas.height);
chatContext.fillStyle = "#000";
chatContext.font = "24px Arial";
chatContext.fillText("Chat iniciado...", 20, 40);

const chatTexture = new THREE.CanvasTexture(chatCanvas);
const chatMaterial = new THREE.MeshBasicMaterial({ map: chatTexture, side: THREE.DoubleSide });
const chatPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1), chatMaterial);
chatPlane.position.set(0, 1.5, -2);
scene.add(chatPlane);

// Lista de mensagens
let chatMessages = ["Chat iniciado..."];

function updateChatPanel() {
    chatContext.fillStyle = "rgba(255,255,255,1)";
    chatContext.fillRect(0, 0, chatCanvas.width, chatCanvas.height);
    chatContext.fillStyle = "#000";
    chatContext.font = "24px Arial";

    let y = 40;
    for (let msg of chatMessages.slice(-8)) {
        chatContext.fillText(msg, 20, y);
        y += 40;
    }
    chatTexture.needsUpdate = true;
}

// Função para adicionar mensagens
export function addChatMessage(message) {
    chatMessages.push(message);
    updateChatPanel();
}

// Reconhecimento de voz (Web Speech API)
let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        addChatMessage("👤 Você: " + transcript);

        // resposta do "chatbot"
        setTimeout(() => {
            const resposta = "Entendi: " + transcript;
            addChatMessage("🤖 Bot: " + resposta);

            // voz de resposta
            const utterance = new SpeechSynthesisUtterance(resposta);
            utterance.lang = "pt-BR";
            speechSynthesis.speak(utterance);
        }, 500);
    };
}

// Botão para ativar voz
const voiceBtn = document.getElementById("voice-btn");
voiceBtn.addEventListener("click", () => {
    if (recognition) recognition.start();
});

// Loop de renderização
function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    lung.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();
