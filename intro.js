// initially enable "normal" night mode
// after keypress, make voice synth "Warning! Power level critical. Process shutdown imminnent!"

// make a slow red fade-flashing and some screenshaking

// voice synth "Entering Emergency Manual Power Restoration Procedure"

// zoom in to diagram, fade to black, start "Camunda Presents" cutscene

// camunda presents fades, Nightmode title screen appears

// maybe for the music: https://www.reddit.com/r/gamedev/comments/4afwah/procedural_music_generator_written_in_javascript/

function makeNight() {
  document.body.style.transition = "filter 2s";
  document.body.style.filter = "invert(1)";
  document.body.style.background = "black";
  document.body.style.overflow = "hidden";
}

function sayPowerCritical() {
  const container = document.createElement("div");
  container.innerHTML =
    '<div style="position: fixed; bottom: 20px; right: 20px; pointer-events: none; width: 350px; height: 100px; background-color: lightblue; border: 2px solid deepskyblue; z-index: 9001; padding: 21px; opacity: 0; transition: 0.2s; font-size: 1.4em; transform: scale(1.5); transform-origin: bottom right;"><span style="float:left; font-size: 70px; margin-top: -22px; margin-right: 20px;">⚠</span><b>Warning!</b><br/> Power Level Critical!</div>';

  document.body.appendChild(container);

  setTimeout(() => {
    container.children[0].style.opacity = 1;
  }, 100);

  window.powerCriticalContainer = container;
}

function startShaking() {
  const start = Date.now();
  function animate() {
    const intensity = (Date.now() - start) / 100;
    const offX = ~~(Math.random() * intensity - intensity / 2);
    const offY = ~~(Math.random() * intensity - intensity / 2);

    let zoom = 1;
    if (intensity > 40) {
      zoom += intensity - 40;
    }

    document.body.style.transform = `scale(${zoom}) translate(${offX}px, ${offY}px)`;

    if (intensity > 60) {
      document.body.style.transform = "";
    } else {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

function fadeToBlack() {
  const blackScreen = document.createElement("div");
  blackScreen.setAttribute("id", "blackscreen");
  blackScreen.style.background = "white";
  blackScreen.style.position = "fixed";
  blackScreen.style.zIndex = "9998";
  blackScreen.style.top = "0";
  blackScreen.style.width = "100%";
  blackScreen.style.height = "100%";
  blackScreen.style.opacity = "0";
  blackScreen.style.transition = "opacity 1s";

  document.body.appendChild(blackScreen);

  window.setTimeout(() => {
    blackScreen.style.opacity = "1";
  }, 100);
}

function restoreBackground() {
  document.body.style.transition = "";

  window.setTimeout(() => {
    document.body.style.filter = "";
    document.body.style.background = "white";
    document.getElementById("blackscreen").style.background = "black";
  }, 100);
}

function showCamundaPresents() {
  const blackScreen = document.getElementById("blackscreen");

  const content = document.createElement("div");

  const logo = document.createElement("div");
  logo.innerHTML =
    '<div cam-widget-header style="border-top: 0; background-color: transparent; box-shadow: none; font-size: 300px; display: inline-block; margin-left: calc(50vw - 650px); margin-top: calc(50vh - 200px);"><span class="brand-logo" style="filter: drop-shadow(0 0 10px #844);"></span> <span style="font-size: 0.7em; vertical-align: text-top; color: #ddd; filter: drop-shadow(0px 0px 5px #fff);">Camunda</span></div>';
  content.appendChild(logo);
  logo.style.transition = "opacity 2s";
  logo.style.opacity = "0";

  const presents = document.createElement("div");
  presents.style.fontSize = "80px";
  presents.style.color = "#ddd";
  presents.style.marginLeft = "calc(50vw + 450px)";
  presents.style.marginTop = "calc(50vh + 80px)";
  presents.style.filter = "drop-shadow(0 0 3px)";
  presents.style.transition = "opacity 2s";
  presents.style.opacity = "0";

  presents.textContent = "presents";
  content.appendChild(presents);

  blackScreen.appendChild(content);

  window.setTimeout(() => {
    logo.style.opacity = "1";
  }, 100);

  window.setTimeout(() => {
    presents.style.opacity = "1";
  }, 1500);

  window.setTimeout(() => {
    logo.style.opacity = "0";
    presents.style.opacity = "0";
  }, 4000);
}

function removeBlackscreen() {
  const blackScreen = document.getElementById("blackscreen");

  blackScreen.parentNode.removeChild(blackScreen);
  window.powerCriticalContainer.parentNode.removeChild(
    window.powerCriticalContainer
  );
  window.emergencyContainer.parentNode.removeChild(window.emergencyContainer);
}

function showNightmodeSplash() {
  const blackScreen = document.getElementById("blackscreen");

  const content = document.createElement("div");
  content.style.position = "absolute";
  content.style.top = "calc(50% - 218px)";
  content.style.fontSize = "300px";
  content.style.left = "calc(50% - 714px)";
  content.style.transition = "filter 3s, opacity 3s";

  // moon
  const moon = document.createElement("div");
  moon.innerHTML = "&#x1F319;&#xFE0E;";
  moon.style.position = "absolute";
  moon.style.top = "0";
  moon.style.left = "1100px";
  moon.style.transition = "opacity 3s, color 0.5s";
  moon.style.opacity = "0";
  content.appendChild(moon);

  const name = document.createElement("div");
  name.innerHTML = "<div>NIGHTMODE</div>";
  name.style.color = "#134f90";
  name.style.fontFamily = "Iceland";
  name.style.transition = "opacity 3s, color 0.5s";
  name.style.opacity = "0";
  name.style.position = "absolute";

  content.appendChild(name);
  blackScreen.appendChild(content);

  window.setTimeout(() => {
    name.style.opacity = "1";
    moon.style.opacity = "1";
  }, 100);

  function makeShadow(intensity) {
    name.style.textShadow = `0 0 ${intensity}px #fff, 0 0 ${intensity *
      2}px #fff, 0 0 ${intensity * 3}px #fff, 0 0 ${intensity *
      4}px #228DFF, 0 0 ${intensity * 7}px #228DFF, 0 0 ${intensity *
      8}px #228DFF, 0 0 ${intensity * 10}px #228DFF, 0 0 ${intensity *
      15}px #228DFF`;
  }

  window.setTimeout(() => {
    name.style.color = "#fff";
    makeShadow(10);
  }, 3500);

  window.setTimeout(
    () => (name.style.transition = "opacity 3s, color 0.5s, text-shadow 1.5s"),
    3600
  );
  window.setTimeout(() => makeShadow(5), 4000);
  window.setTimeout(() => makeShadow(10), 6500);
  window.setTimeout(() => makeShadow(5), 8000);

  window.setTimeout(() => {
    content.style.filter = "blur(200px)";
    content.style.opacity = "0";
  }, 8000);
}

function sayEnteringEmergency() {
  const container = document.createElement("div");
  container.innerHTML =
    '<div style="position: fixed; top: calc(50vh - 50px); pointer-events: none; left: calc(50vw - 250px); width: 500px; height: 100px; background-color: lightblue; border: 2px solid deepskyblue; z-index: 9002; padding: 21px; opacity: 0; transition: 0.5s; font-size: 1.4em; transform: scale(2); transform-origin: middle;"><span style="float:left; font-size: 70px; margin-top: -22px; margin-right: 20px;">⚠</span><b>Entering Emergency Energy Restoration Procedure!</b></div>';

  document.body.appendChild(container);

  setInterval(() => {
    container.children[0].style.opacity = +!(
      container.children[0].style.opacity === "1"
    );
  }, 500);

  window.emergencyContainer = container;
}

export default function intro() {
  return new Promise(resolve => {
    // step 1
    makeNight();

    const animationStep2 = ({ key }) => {
      if (key === "F2") {
        document.removeEventListener("keydown", animationStep2);
        window.setTimeout(sayEnteringEmergency, 6000);
        window.setTimeout(startShaking, 8000);
        window.setTimeout(fadeToBlack, 13000);
        window.setTimeout(restoreBackground, 14100);
        window.setTimeout(showCamundaPresents, 14300);
        window.setTimeout(showNightmodeSplash, 20300);
        window.setTimeout(resolve, 29300);
        window.setTimeout(removeBlackscreen, 40000);
      }
    };

    const introAnimation = ({ key }) => {
      if (key === "F2") {
        document.removeEventListener("keydown", introAnimation);

        window.setTimeout(() => {
          sayPowerCritical();
          document.addEventListener("keydown", animationStep2);
        }, 4000);
      }
      return;
    };

    document.addEventListener("keydown", introAnimation);
  });
}
