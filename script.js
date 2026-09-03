(() => {
  "use strict";

  const intro = document.querySelector("[data-fe-intro]");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const header = document.querySelector("[data-header]");
  const updateHeaderState = () => {
    header?.classList.toggle("fe-header--scrolled", window.scrollY > 40);
  };

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  const removeIntro = () => {
    document.body.classList.remove("fe-intro-active");
    intro?.remove();
  };

  if (!intro || reducedMotion) {
    removeIntro();
    window.FastEnergy = Object.freeze({ gsap: window.gsap || null });
    return;
  }

  document.body.classList.add("fe-intro-active");

  const gsap = window.gsap;

  if (!gsap) {
    removeIntro();
    window.FastEnergy = Object.freeze({ gsap: null });
    return;
  }

  const circuitSides = [...intro.querySelectorAll("[data-circuit-side]")];
  const sideSegments = circuitSides.map((side) => [
    ...side.querySelectorAll("[data-circuit-segment]"),
  ]);
  const circuitSegments = sideSegments.flat();
  const circuitCore = intro.querySelector("[data-circuit-core]");
  const panels = intro.querySelectorAll(".fe-intro__panel");

  gsap.set(circuitSegments, { autoAlpha: 1 });
  circuitSegments.forEach((segment) => {
    gsap.set(
      segment,
      segment.dataset.axis === "y" ? { scaleY: 0 } : { scaleX: 0 }
    );
  });
  gsap.set(circuitCore, { autoAlpha: 0, scale: 0.2 });

  const timeline = gsap
    .timeline({
      defaults: { ease: "expo.out" },
      onComplete: removeIntro,
    })
    .to(circuitCore, { autoAlpha: 1, scale: 1, duration: 0.22 }, 0.04);

  sideSegments[0].forEach((leftSegment, index) => {
    const rightSegment = sideSegments[1][index];
    const axis = leftSegment.dataset.axis === "y" ? "scaleY" : "scaleX";

    timeline.to(
      [leftSegment, rightSegment],
      { [axis]: 1, duration: 0.18, ease: "power3.out" },
      0.12 + index * 0.17
    );
  });

  timeline
    .to(
      panels,
      {
        xPercent: (index) => (index === 0 ? -100 : 100),
        duration: 0.65,
        ease: "expo.inOut",
        stagger: 0.015,
      },
      1.05
    )
    .to(
      [...circuitSegments, circuitCore],
      { autoAlpha: 0, duration: 0.15, ease: "power2.out" },
      1.12
    );

  window.FastEnergy = Object.freeze({ gsap });
})();

(() => {
  "use strict";

  const services = document.querySelector("[data-services]");

  if (!services) {
    return;
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    return;
  }

  services.classList.add("fe-services--motion-ready");

  services
    .querySelectorAll("[data-service-trigger]")
    .forEach((service, index) => {
      service.style.setProperty("--service-delay", `${index * 55}ms`);
    });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        return;
      }

      services.classList.add("is-visible");
      observer.disconnect();
    },
    { rootMargin: "0px 0px -12% 0px" }
  );

  observer.observe(services);
})();

(() => {
  "use strict";

  const services = document.querySelector("[data-services]");
  const triggers = services
    ? [...services.querySelectorAll("[data-service-trigger]")]
    : [];
  const currentImage = services?.querySelector("[data-service-current]");
  const nextImage = services?.querySelector("[data-service-next]");
  const currentName = services?.querySelector("[data-service-current-name]");
  const description = services?.querySelector("[data-service-description]");

  if (!services || !triggers.length || !currentImage || !nextImage) {
    return;
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  let swapId = 0;

  const updateImage = (trigger) => {
    const imagePath = trigger.dataset.serviceImage;

    if (!imagePath || currentImage.getAttribute("src") === imagePath) {
      return;
    }

    if (reducedMotion) {
      currentImage.src = imagePath;
      currentImage.alt = trigger.dataset.serviceAlt || "";
      return;
    }

    const currentSwap = ++swapId;

    nextImage.onload = () => {
      if (currentSwap !== swapId) {
        return;
      }

      nextImage.classList.remove("is-entering");
      void nextImage.offsetWidth;
      nextImage.classList.add("is-entering");
      nextImage.addEventListener(
        "animationend",
        () => {
          if (currentSwap !== swapId) {
            return;
          }

          currentImage.src = imagePath;
          currentImage.alt = trigger.dataset.serviceAlt || "";
          nextImage.classList.remove("is-entering");
        },
        { once: true }
      );
    };

    nextImage.src = imagePath;
  };

  const activate = (trigger) => {
    triggers.forEach((item) => {
      item.classList.toggle("is-active", item === trigger);
    });

    if (currentName) {
      currentName.textContent = trigger.dataset.serviceName || "";
    }

    if (description) {
      description.textContent = trigger.dataset.serviceDescription || "";
    }

    updateImage(trigger);
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("focus", () => activate(trigger));
    trigger.addEventListener("click", () => activate(trigger));

    if (canHover) {
      trigger.addEventListener("pointerenter", () => activate(trigger));
    }
  });
})();

(() => {
  "use strict";

  const contactForm = document.querySelector("[data-contact-form]");

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
  });
})();

(() => {
  "use strict";

  const form = document.querySelector("[data-calculator-form]");
  const result = document.querySelector("[data-calculator-result]");

  if (!form || !result) {
    return;
  }

  const consumptionInput = form.querySelector('[data-calc-input="consumption"]');
  const costInput = form.querySelector('[data-calc-input="cost"]');
  const batteryOptions = [
    ...form.querySelectorAll("[data-battery-option]"),
  ];
  const consumptionOutput = form.querySelector("[data-calc-consumption-output]");
  const costOutput = form.querySelector("[data-calc-cost-output]");
  const savingsOutput = result.querySelector("[data-calc-savings]");
  const currentCostOutput = result.querySelector("[data-calc-current-cost]");
  const optimizedCostOutput = result.querySelector("[data-calc-optimized-cost]");
  const paybackOutput = result.querySelector("[data-calc-payback]");
  const currentBar = result.querySelector(".fe-calc-meter__fill--current");
  const optimizedBar = result.querySelector(".fe-calc-meter__fill--optimized");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (
    !consumptionInput ||
    !costInput ||
    !consumptionOutput ||
    !costOutput ||
    !savingsOutput ||
    !currentCostOutput ||
    !optimizedCostOutput ||
    !paybackOutput ||
    !currentBar ||
    !optimizedBar
  ) {
    return;
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat("nl-BE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);

  const formatNumber = (value) =>
    new Intl.NumberFormat("nl-BE", { maximumFractionDigits: 0 }).format(value);

  const clamp = (value, minimum, maximum) =>
    Math.min(Math.max(value, minimum), maximum);

  /*
   * Indicatieve demo-formule. Vervang deze functie later door echte
   * berekeningen op basis van tarief, installatie en meetgegevens.
   */
  const calculateIndicativeEstimate = ({ consumption, cost, hasBattery }) => {
    const usageFactor = clamp((consumption - 2000) / 10000, 0, 1);
    const costFactor = clamp((cost - 500) / 4500, 0, 1);
    const baseEfficiency = 0.08 + usageFactor * 0.07 + costFactor * 0.05;
    const batteryEfficiency = hasBattery ? 0.08 : 0.025;
    const savingsRate = clamp(baseEfficiency + batteryEfficiency, 0.1, 0.3);
    const savings = Math.max(50, Math.round((cost * savingsRate) / 10) * 10);
    const optimizedCost = Math.max(cost - savings, 0);
    const estimatedInvestment = hasBattery
      ? 4200 + consumption * 0.12
      : 1800 + consumption * 0.04;
    const payback = estimatedInvestment / savings;
    return {
      savings,
      optimizedCost,
      payback,
      optimizedBarScale: clamp(optimizedCost / cost, 0.2, 1),
    };
  };

  let hasBattery = true;
  let displayedSavings = 0;
  let animationFrame;
  let sweepTimeout;

  const animateSavings = (target) => {
    if (reducedMotion) {
      displayedSavings = target;
      savingsOutput.textContent = formatCurrency(target);
      return;
    }

    const start = displayedSavings;
    const startTime = performance.now();
    const duration = 360;

    cancelAnimationFrame(animationFrame);

    const tick = (now) => {
      const progress = clamp((now - startTime) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      displayedSavings = start + (target - start) * eased;
      savingsOutput.textContent = formatCurrency(displayedSavings);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame(tick);
  };

  const updateRangeProgress = (input) => {
    const min = Number(input.min);
    const max = Number(input.max);
    const value = Number(input.value);
    const progress = ((value - min) / (max - min)) * 100;
    input.style.setProperty("--range-progress", `${progress}%`);
  };

  const triggerSweep = () => {
    if (reducedMotion) {
      return;
    }

    result.classList.remove("is-updating");
    void result.offsetWidth;
    result.classList.add("is-updating");
    clearTimeout(sweepTimeout);
    sweepTimeout = window.setTimeout(() => {
      result.classList.remove("is-updating");
    }, 450);
  };

  const updateCalculator = ({ animate = true } = {}) => {
    const consumption = Number(consumptionInput.value);
    const cost = Number(costInput.value);
    const estimate = calculateIndicativeEstimate({
      consumption,
      cost,
      hasBattery,
    });

    updateRangeProgress(consumptionInput);
    updateRangeProgress(costInput);
    consumptionOutput.textContent = `${formatNumber(consumption)} kWh`;
    costOutput.textContent = formatCurrency(cost);
    currentCostOutput.textContent = formatCurrency(cost);
    optimizedCostOutput.textContent = formatCurrency(estimate.optimizedCost);
    paybackOutput.textContent = `${estimate.payback.toFixed(1).replace(".", ",")} jaar`;
    currentBar.style.setProperty("--bar-scale", "1");
    optimizedBar.style.setProperty(
      "--bar-scale",
      String(estimate.optimizedBarScale)
    );

    if (animate) {
      animateSavings(estimate.savings);
      triggerSweep();
    } else {
      displayedSavings = estimate.savings;
      savingsOutput.textContent = formatCurrency(estimate.savings);
    }
  };

  const selectBattery = (option) => {
    hasBattery = option.dataset.batteryOption === "true";
    batteryOptions.forEach((item) => {
      const isSelected = item === option;
      item.classList.toggle("is-selected", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });
    updateCalculator();
  };

  form.addEventListener("submit", (event) => event.preventDefault());
  consumptionInput.addEventListener("input", () => updateCalculator());
  costInput.addEventListener("input", () => updateCalculator());
  batteryOptions.forEach((option) => {
    option.addEventListener("click", () => selectBattery(option));
  });

  updateCalculator({ animate: false });
})();
