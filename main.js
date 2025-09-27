// Inicializar toda la funcionalidad cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", function () {
    
  // Selectores del DOM
  const getDomElement = (selector, parent = document) =>
    parent.querySelector(selector);
  const getAllDomElements = (selector, parent = document) =>
    parent.querySelectorAll(selector);

  // Listeners
  const addListener = (element = document, event, callback) =>
    element.addEventListener(event, callback);

  // Sección Hero
  const heroCarousel = getDomElement("#heroCarousel");
  const heroImages = getAllDomElements(".hero-img");

  // Efecto parallax al hacer scroll
  addListener(document, "scroll", function () {
    const parallax = window.pageYOffset * 0.5;
    heroImages.forEach((img) => {
      if (img.closest(".carousel-item").classList.contains("active")) {
        img.style.transform = `scale(1.05) translateY(${parallax}px)`;
      }
    });
  });

  // Transiciones de imágenes del carrusel
  if (heroCarousel) {
    addListener(heroCarousel, "slide.bs.carousel", function (e) {
      const activeImg = getDomElement(".hero-img", e.relatedTarget);
      setTimeout(() => (activeImg.style.transform = "scale(1.05)"), 100);
    });
  }

  // Filtrado de galería y modal
  const filterButtons = getAllDomElements("[data-filter]");
  const galleryItems = getAllDomElements(".gallery-item");

  // Configurar filtros de galería
  for (const button of filterButtons) {
    addListener(button, "click", function () {
      const filter = button.getAttribute("data-filter");

      // Actualizar botón activo
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Filtrar elementos de la galería
      galleryItems.forEach((item) => {
        const category = item.getAttribute("data-category");
        const shouldShow = filter === "all" || category === filter;

        item.classList.toggle("hidden", !shouldShow);
        setTimeout(
          () => {
            item.style.display = shouldShow ? "block" : "none";
          },
          shouldShow ? 50 : 500
        );
      });
    });
  }

  const form = getDomElement("#contactForm");
  const formMessage = getDomElement("#formMessage");

  // Inicializar Pristine con configuración personalizada
  const pristineConfig = {
    classTo: "form-group",
    errorClass: "has-danger",
    successClass: "has-success",
    errorTextParent: "form-group",
    errorTextTag: "div",
    errorTextClass: "text-danger",
    errorTextPosition: "after",
  };

  let pristine = new Pristine(form, pristineConfig);

  // Agregar validación en tiempo real para todos los campos del formulario
  getAllDomElements("input, select, textarea", form).forEach((field) => {
    // Validar al escribir
    addListener(field, "input", function () {
      pristine.validate(field);
      // Actualizar clase del form-group padre
      const formGroup = field.closest(".form-group");
      if (formGroup) {
        formGroup.classList.toggle("has-danger", !pristine.validate(field));
      }
    });

    // Validar al perder el foco
    addListener(field, "blur", function () {
      pristine.validate(field);
      // Actualizar clase del form-group padre
      const formGroup = field.closest(".form-group");
      if (formGroup) {
        formGroup.classList.toggle("has-danger", !pristine.validate(field));
      }
    });
  });

  // Agregar validador personalizado para fecha de viaje
  pristine.addValidator(
    getDomElement("#travelDate", form),
    function (value) {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      return selectedDate >= today;
    },
    "La fecha de viaje debe ser posterior a hoy",
    2,
    false
  );

  // Agregar validador personalizado para longitud del nombre
  pristine.addValidator(
    getDomElement("#name", form),
    function (value) {
      return value.length >= 3;
    },
    "El nombre debe tener al menos 3 caracteres",
    2,
    false
  );

  // Agregar validador personalizado para longitud del mensaje
  pristine.addValidator(
    getDomElement("#message", form),
    function (value) {
      return value.length >= 10;
    },
    "El mensaje debe tener al menos 10 caracteres",
    2,
    false
  );

  addListener(form, "submit", async function (e) {
    e.preventDefault();
    const valid = pristine.validate();

    if (valid) {
      const submitButton = getDomElement('button[type="submit"]', form);
      const originalButtonText = submitButton.innerHTML;

      try {
        // Deshabilitar el botón de envío y mostrar estado de carga
        submitButton.disabled = true;
        submitButton.innerHTML =
          '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';

        // Simular envío del formulario (reemplazar con tu lógica real de envío)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mostrar mensaje de éxito
        formMessage.style.display = "block";
        formMessage.className = "alert alert-success mt-3";
        formMessage.textContent =
          "¡Gracias por tu mensaje! Te contactaremos pronto.";

        // Reiniciar formulario
        form.reset();
        pristine.reset();
      } catch (error) {
        // Mostrar mensaje de error
        formMessage.style.display = "block";
        formMessage.className = "alert alert-danger mt-3";
        formMessage.textContent =
          "Hubo un error al enviar el formulario. Por favor intenta nuevamente.";
      } finally {
        // Volver a habilitar el botón de envío y restaurar el texto original
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    } else {
      // Mostrar mensaje de error de validación
      formMessage.style.display = "block";
      formMessage.className = "alert alert-danger mt-3";
      formMessage.textContent =
        "Por favor, corrige los errores en el formulario.";

      // Desplazarse al primer error
      const firstError = getDomElement(".has-danger", form);
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });
});
