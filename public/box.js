// let oceanFloorContents = document.querySelector(".ocean-floor-contents");
//       let oceanEl = document.querySelector(".ocean");
//       function generateSeaWeed(bottom, left, scale) {
//         let oceanFloor = document.querySelector(".ocean-floor");

//         let seaWeedParent = document.createElement("div");
//         seaWeedParent.className = "seaweed-parent";
//         for (let i = 0; i < 3; i++) {
//           let seaweedSection = document.createElement("div");
//           seaweedSection.className = `seaweed-section seaweed-section-${i + 1}`;
//           let lastNode;
//           for (let j = 0; j < 10; j++) {
//             let seaweed = document.createElement("div");
//             seaweed.className = `seaweed seaweed-animation-${i + 1}`;

//             if (!lastNode) {
//               console.log("no children!");
//               seaweedSection.appendChild(seaweed);
//             } else {
//               lastNode.appendChild(seaweed);
//             }
//             lastNode = seaweed;
//           }
//           seaWeedParent.appendChild(seaweedSection);
//         }
//         oceanFloorContents.appendChild(seaWeedParent);
//         seaWeedParent.style.left = left;
//         seaWeedParent.style.bottom = bottom;
//         seaWeedParent.style.transform = `rotate(-90deg)scale(${scale})`;
//       }

//       generateSeaWeed("1rem", "5%", 0.4);
//       generateSeaWeed(".85rem", "45%", 0.6);
//       generateSeaWeed("1.1rem", "85%", 0.3);

//       function generateShells(count) {
//         for (let i = 0; i < count; i++) {
//           let shell = document.createElement("div");
//           shell.className = "shell";
//           let left = Math.random() * 100;
//           let bottom = Math.random() * 1;
//           left = left > 15 ? left : 15;
//           shell.style.left = `${left}%`;
//           // shell.style.width = width;
//           // shell.style.height = height;
//           shell.style.bottom = `${bottom}rem`;
//           oceanFloorContents.appendChild(shell);
//         }
//       }

//       generateShells(4);

//       function generateFish(count) {
//         for (let i = 0; i < count; i++) {
//           let color = `rgb(${(Math.random() * 255) | 0},${
//             (Math.random() * 255) | 0
//           },${(Math.random() * 255) | 0})`;
//           let fishEl = document.createElement("div");
//           let bottom = (Math.random() * 100) | 0;
//           bottom = bottom > 15 ? bottom : 15;
//           fishEl.className = "fish-body";
//           fishEl.style.bottom = `${bottom}%`;
//           fishEl.style.setProperty("--color", color);
//           let time = (Math.random() * 15) | (0 + 12);
//           let delay = (Math.random() * 8) | 0;
//           let animationStyle =
//             Math.random() > 0.5 ? "cubic-bezier(.2,.4,.8,1.2)" : "linear";

//           if (Math.random() > 0.5) {
//             fishEl.classList.add("fish-swim-left");

//             fishEl.style.animation = `fishswimleft ${time}s ${delay}s ${animationStyle} infinite`;
//           } else {
//             fishEl.classList.add("fish-swim-right");
//             let style =
//               Math.random() > 0.5 ? "cubic-bezier(.2,.4,.8,1.2)" : "linear";
//             fishEl.style.animation = `fishswimright ${time}s ${delay}s ${animationStyle} infinite`;
//           }
//           oceanEl.appendChild(fishEl);
//         }
//       }

//       generateFish(6);



//       function generateOctopus() {
//         let animations = [
//           "octopus-animation-1",
//           "octopus-animation-2",
//           "octopus-animation-3",
//           // "octopus-animation-4",
//         ];
//         let octopus = document.createElement("div");
//         let octopusHead = document.createElement("div");
//         let octopusBody = document.createElement("div");
//         octopus.className = "octopus";
//         octopusHead.className = "octopus-head";
//         octopusBody.className = "octopus-body";
//         octopus.appendChild(octopusHead);
//         octopus.appendChild(octopusBody);

//         oceanEl.appendChild(octopus);
//         for (let i = 0; i < 8; i++) {
//           let octopusArm = document.createElement("div");
//           octopusArm.className = "octopus-arm";
//           octopusBody.appendChild(octopusArm);
//           let animation = animations[(Math.random() * animations.length) | 0];
//           let lastNode;
//           for (let j = 0; j < 10; j++) {
//             let armBit = document.createElement("div");
//             armBit.className = `octopus-tentacle-segment ${animation}`;
//             if (!lastNode) {
//               octopusArm.appendChild(armBit);
//             } else {
//               lastNode.appendChild(armBit);
//             }
//             lastNode = armBit;
//           }
//         }
//       }

//       generateOctopus();

      const pond = document.getElementById('pond');
      // const oceanFloorContents = document.querySelector(".ocean-floor-contents");
      const ocean = document.querySelector('.ocean'); // Get the ocean element
      const messageInput = document.getElementById('message-input');
      const messageTitle = document.getElementById('message-title'); // Get title input
      const throwButton = document.getElementById('throw-button');
      
      throwButton.addEventListener('click', () => {
          const title = messageTitle.value.trim(); // Get the title
          const message = messageInput.value.trim();
          if (title !== "" && message !== "") { // Check if both title and message are entered
              createBottle(title, message); // Pass both to createBottle
              messageInput.value = ""; // Clear input fields
              messageTitle.value = "";
          }
      });
      
      function createBottle(title, message) {
        const bottle = document.createElement('div');
        bottle.classList.add('bottle');
      
          const x = Math.random() * (pond.offsetWidth - 50);
          const y = Math.random() * (pond.offsetHeight - 80);
      
          bottle.style.left = x + 'px';
          bottle.style.top = y + 'px';
      
          const titleSpan = document.createElement('span');
          titleSpan.textContent = title;
          bottle.appendChild(titleSpan);
      
          bottle.addEventListener('click', () => {
              showMessagePopup(title, message);
          });
      
          pond.appendChild(bottle); // Append to pond, not ocean
      }
      
      function showMessagePopup(title, message) { // Add title parameter
          const popup = document.createElement('div');
          popup.classList.add('message-popup');
          popup.innerHTML = `<h2>${title}</h2><p>${message}</p><button onclick="closeMessagePopup()">Close</button>`; // Include title in popup
          document.body.appendChild(popup);
      }
      
      // ... (closeMessagePopup function remains the same) ...
      function closeMessagePopup() {
          const popup = document.querySelector('.message-popup');
          popup.remove();
      }   

      function checkLocalStorage() {
        const total = Object.keys(localStorage).reduce((sum, key) => {
            return sum + localStorage.getItem(key).length;
        }, 0);
    
        console.log(`Total localStorage size: ${total} bytes`);
    
        // Check if the size exceeds a certain limit (e.g., 5MB)
        if (total > 5 * 1024 * 1024) { // 5MB
            console.warn('localStorage size exceeds 5MB. Clearing storage...');
            localStorage.clear(); // Clear localStorage
        }
    }
    
    // Call the function to check localStorage size
    checkLocalStorage();