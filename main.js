
import * as THREE from 'three';
import './style.css';

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';





// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/lakeside_night_1k.hdr', function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
 
});

// Basic cube mesh

camera.position.z = 10;

const radius = 1;
const segments = 64;
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
const textures = [ `${import.meta.env.BASE_URL}public/2_no_clouds_16k.jpeg`,
  `${import.meta.env.BASE_URL}public/2k_mars.jpg`,
  `${import.meta.env.BASE_URL}public/mercurytex.avif`,
  `${import.meta.env.BASE_URL}public/jupi_2.avif`];

const spheres = new THREE.Group();

// Create a large sphere with a stars texture

const starTexture = new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}public/stars.jpg`);

starTexture.colorSpace = THREE.SRGBColorSpace;
const starGeometry = new THREE.SphereGeometry(50, 64, 64);

const starMaterial = new THREE.MeshBasicMaterial({
  map: starTexture,
  
  side: THREE.BackSide

});
const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere);

const spheresMesh = [];


for(let i=0; i< 4; i++){
  const sphereGeometry = new THREE.SphereGeometry(radius, segments, segments);
  const sphereMaterial = new THREE.MeshStandardMaterial({ map: textures[i] });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

  spheresMesh.push(sphere);

  const loader = new THREE.TextureLoader();
   const texture = loader.load(textures[i]);
   texture.colorSpace = THREE.SRGBColorSpace;

  sphereMaterial.map = texture;

  const angle = (i / 4) * (Math.PI * 2);
  sphere.position.x = Math.cos(angle) * 4;
  sphere.position.z = Math.sin(angle) * 4;
  spheres.add(sphere);
}

spheres.rotation.x = 0.2;
spheres.position.y = -0.3;
scene.add(spheres);

// throttling code
let lastWheelTime = 0;
const throttledDelay = 2000; // 2 second delay
let currentHeadingIndex = 0; // Track current visible heading
const headings = document.querySelectorAll('.heading');
const totalHeadings = headings.length;

function throttledWheelHandler(event) {
  const currentTime = Date.now();
  if (currentTime - lastWheelTime >= throttledDelay) {
    lastWheelTime = currentTime;

    const direction = event.deltaY > 0 ? "down" : "up";
    
    // Hide current heading
    gsap.to(headings[currentHeadingIndex], {
      duration: 0.5,
      opacity: 0,
      ease: "power2.inOut",
    });

    // Calculate next heading index
    if (direction === "down") {
      currentHeadingIndex = (currentHeadingIndex + 1) % totalHeadings;
    } else {
      currentHeadingIndex = (currentHeadingIndex - 1 + totalHeadings) % totalHeadings;
    }

    gsap.to(spheres.rotation,{
      duration: 1,
      y: `+=${Math.PI / 2}`,
      ease: "power2.inOut",
    })

    // Show next heading after a delay
    setTimeout(() => {
      gsap.to(headings[currentHeadingIndex], {
        duration: 0.5,
        opacity: 1,
        ease: "power2.inOut",
      });
    }, 1000); // 0.5 second delay between hide and show
  }
}

window.addEventListener("wheel", throttledWheelHandler);


const clock = new THREE.Clock();
 


function animate() {
  requestAnimationFrame(animate);
  for(let i=0; i < spheresMesh.length; i++){
    const sphere = spheresMesh[i];
    sphere.rotation.y = clock.getElapsedTime() * 0.04; // Rotate each sphere
  }

  renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});