
    // CONTROL DEL PIN
    const PIN_CORRECTO = "112233";
    let enteredPin = "";

    function updateDots() {
      for (let i = 0; i < 6; i++) {
        document.getElementById(`dot${i}`).classList.toggle('filled', i < enteredPin.length);
      }
    }
    function addPin(num) {
      if (enteredPin.length < 6) {
        enteredPin += num;
        updateDots();
        if (enteredPin.length === 6) setTimeout(checkPin, 150);
      }
    }
    function deletePin() {
      if (enteredPin.length > 0) {
        enteredPin = enteredPin.slice(0, -1);
        updateDots();
      }
    }
    function clearPin() {
      enteredPin = "";
      updateDots();
    }
    function checkPin() {
      if (enteredPin === PIN_CORRECTO) {
        document.getElementById('lockScreen').classList.add('unlocked');
      } else {
        const box = document.getElementById('pinBox');
        box.classList.add('shake');
        setTimeout(() => {
          box.classList.remove('shake');
          clearPin();
        }, 400);
      }
    }
    window.addEventListener('keydown', (e) => {
      if (!document.getElementById('lockScreen').classList.contains('unlocked')) {
        if (e.key >= '0' && e.key <= '9') addPin(e.key);
        if (e.key === 'Backspace') deletePin();
      }
    });

    // ESTADO Y CARGA DEL CATÁLOGO
    const WHATSAPP_NUM = "3425080922";
    let catalogData = [];
    let selectedBrand = "TODAS";

    function toggleSidebar() {
      document.getElementById('brandSidebar').classList.toggle('active');
      document.getElementById('sidebarOverlay').classList.toggle('active');
    }

    // CONTROL DE MODALES INFORMATIVOS (CÓMO COMPRAR, QUIÉNES SOMOS, FORMA DE ENTREGA)
    function openInfoModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add('active');
    }

    function closeInfoModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('active');
    }

    function closeInfoModalOnOverlay(e, modalId) {
      if (e.target.id === modalId) {
        closeInfoModal(modalId);
      }
    }

    async function loadProductsFromJSON() {
      try {
        const response = await fetch('productos.json?v=' + Date.now());
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        catalogData = await response.json();
        createSidebarBrandList(catalogData);
        applyFilters();
      } catch (error) {
        console.error("Error al cargar productos.json:", error);
        document.getElementById("catalogContainer").innerHTML = `
          <div style="text-align: center; padding: 4rem 1rem; color: #ef4444;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>No se pudo cargar productos.json</h3>
            <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 8px;">
              Asegurate de que 'productos.json' esté generado y corras la página desde un servidor local (Live Server).
            </p>
          </div>
        `;
      }
    }

    document.addEventListener("DOMContentLoaded", () => {
      loadProductsFromJSON();
    });

    function sanitizePath(path) {
      if (!path) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
      if (path.startsWith("http")) return path;

      return path
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');
    }

    function createSidebarBrandList(data) {
      const container = document.getElementById("sidebarBrandList");
      if (!container) return;

      container.innerHTML = "";
      const totalModelos = data.reduce((acc, g) => acc + (g.items ? g.items.length : 0), 0);

      const allBtn = document.createElement("button");
      allBtn.className = "sidebar-item active";
      allBtn.innerHTML = `
        <span><i class="fa-solid fa-border-all" style="margin-right: 8px;"></i> Todas</span>
        <span style="font-size: 0.75rem; opacity: 0.8;">${totalModelos}</span>
      `;
      allBtn.onclick = () => selectBrand("TODAS", allBtn);
      container.appendChild(allBtn);

      data.forEach(group => {
        const btn = document.createElement("button");
        btn.className = "sidebar-item";
        const count = group.items ? group.items.length : 0;
        btn.innerHTML = `
          <span><i class="fa-solid ${group.icono || 'fa-glasses'}" style="margin-right: 8px;"></i> ${group.marca}</span>
          <span style="font-size: 0.75rem; opacity: 0.8;">${count}</span>
        `;
        btn.onclick = () => selectBrand(group.marca, btn);
        container.appendChild(btn);
      });
    }

    function selectBrand(marca, btnElement) {
      selectedBrand = marca;
      document.querySelectorAll(".sidebar-item").forEach(b => b.classList.remove("active"));
      btnElement.classList.add("active");
      toggleSidebar();
      applyFilters();
    }

    function applyFilters() {
      const q = document.getElementById("searchInput").value.toLowerCase().trim();

      const filtered = catalogData
        .filter(brandGroup => {
          if (selectedBrand === "TODAS") return true;
          return brandGroup.marca.toLowerCase() === selectedBrand.toLowerCase();
        })
        .map(brandGroup => {
          if (!q) return brandGroup;

          const matchesBrand = brandGroup.marca.toLowerCase().includes(q);
          const filteredItems = brandGroup.items.filter(item => {
            return matchesBrand || 
                   item.nombre.toLowerCase().includes(q) || 
                   item.codigo.toLowerCase().includes(q) || 
                   item.descripcion.toLowerCase().includes(q);
          });

          return { ...brandGroup, items: filteredItems };
        })
        .filter(brandGroup => brandGroup.items && brandGroup.items.length > 0);

      renderBrands(filtered);
    }

    function handleSearch() {
      applyFilters();
    }

    function renderBrands(data) {
      const container = document.getElementById("catalogContainer");
      container.innerHTML = "";
      let totalCoincidencias = 0;

      data.forEach(brandGroup => {
        if (!brandGroup.items || brandGroup.items.length === 0) return;
        totalCoincidencias += brandGroup.items.length;

        const parentCard = document.createElement("section");
        parentCard.className = "brand-parent-card";

        parentCard.innerHTML = `
          <div class="brand-header">
            <div class="brand-title-wrap">
              <i class="fa-solid ${brandGroup.icono || 'fa-glasses'}"></i>
              <div>
                <h2>${brandGroup.marca}</h2>
                <p style="color: var(--text-muted); font-size: 0.85rem;">${brandGroup.descripcion}</p>
              </div>
            </div>
            <div class="brand-counter">${brandGroup.items.length} modelos</div>
          </div>
          <div class="children-grid" id="grid-${brandGroup.marca.replace(/\s+/g, '')}"></div>
        `;

        container.appendChild(parentCard);

        const childrenGrid = parentCard.querySelector(".children-grid");
        brandGroup.items.forEach(prod => {
          const coverPhoto = prod.fotos && prod.fotos.length > 0 ? prod.fotos[0] : "";

          const childCard = document.createElement("div");
          childCard.className = "product-card";
          childCard.onclick = () => openProductModal(brandGroup.marca, prod);

          childCard.innerHTML = `
            <div class="product-img-box">
              <span class="badge-code">${prod.codigo}</span>
              ${prod.fotos && prod.fotos.length > 1 ? `<span class="badge-photos-count"><i class="fa-solid fa-images"></i> ${prod.fotos.length}</span>` : ''}
              <img src="${sanitizePath(coverPhoto)}" 
                   alt="${prod.nombre}"
                   onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';">
            </div>
            <div class="product-body">
              <h4 class="product-title">${prod.nombre}</h4>
              <p class="product-desc">${prod.descripcion}</p>
              <div class="product-footer">
                <span class="btn-view-details">Ver galería <i class="fa-solid fa-arrow-right"></i></span>
                <span style="font-size: 0.75rem; color: var(--gold-light); font-weight: 600;">● Disponible</span>
              </div>
            </div>
          `;
          childrenGrid.appendChild(childCard);
        });
      });

      if (totalCoincidencias === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 4rem 1rem;">
            <i class="fa-solid fa-box-open" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
            <h3>No se encontraron productos</h3>
          </div>
        `;
      }
    }

    function openProductModal(brandName, product) {
      document.getElementById("modalBrandTag").innerText = `${brandName} • CÓDIGO ${product.codigo}`;
      document.getElementById("modalTitle").innerText = product.nombre;
      document.getElementById("modalDescription").innerText = product.descripcion;

      const wsText = encodeURIComponent(`Hola, me interesa el modelo:\n*${brandName} - ${product.nombre}*\nCódigo: ${product.codigo} (${product.id})\n¿Tienen stock disponible?`);
      document.getElementById("modalWsLink").href = `https://wa.me/${WHATSAPP_NUM}?text=${wsText}`;

      const fotos = (product.fotos && product.fotos.length > 0) ? product.fotos : [];
      const mainImg = document.getElementById("modalMainImg");
      mainImg.src = sanitizePath(fotos[0] || "");

      const thumbsContainer = document.getElementById("modalThumbnails");
      thumbsContainer.innerHTML = "";

      fotos.forEach((fotoUrl, index) => {
        const thumb = document.createElement("div");
        thumb.className = `thumb-item ${index === 0 ? 'active' : ''}`;
        thumb.innerHTML = `<img src="${sanitizePath(fotoUrl)}" alt="Miniatura">`;
        
        thumb.onclick = () => {
          mainImg.src = sanitizePath(fotoUrl);
          document.querySelectorAll(".thumb-item").forEach(t => t.classList.remove("active"));
          thumb.classList.add("active");
        };

        thumbsContainer.appendChild(thumb);
      });

      document.getElementById("productModal").classList.add("active");
    }

    document.getElementById('modalMainImg').addEventListener('click', () => {
      const currentSrc = document.getElementById('modalMainImg').src;
      if (!currentSrc) return;
      document.getElementById('zoomImage').src = currentSrc;
      document.getElementById('zoomModal').classList.add('active');
    });

    function closeZoom() { document.getElementById('zoomModal').classList.remove('active'); }
    function closeModal() { document.getElementById("productModal").classList.remove("active"); }
    function closeModalOnOverlay(e) { if (e.target.id === "productModal") closeModal(); }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (document.getElementById('zoomModal').classList.contains('active')) {
          closeZoom();
          e.stopPropagation();
          return;
        }
        closeModal();
        closeInfoModal('modalComoComprar');
        closeInfoModal('modalQuienesSomos');
        closeInfoModal('modalFormaEntrega');
        if (document.getElementById('brandSidebar').classList.contains('active')) {
          toggleSidebar();
        }
      }
    });
