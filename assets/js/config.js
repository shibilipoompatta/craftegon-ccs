/**
 * ==========================================================================
 * CRAFTEGON CORPORATE SERVICES (CCS) - CENTRAL CLIENT CONFIGURATION
 * Canonical source of truth for business contact details & institutional metadata
 * ==========================================================================
 */

(function () {
  const config = {
    brandName: "CraftEgon Corporate Services",
    brandShort: "CraftEgon CCS",
    brandSubtitle: "Corporate Services",
    legalEntity: "CraftEgon LLP",
    headquarters: "Kozhikode, Kerala, India • PIN: 673001",
    statutoryReg: "MCA V3 • RBI FIRMS • IP India",
    
    // Canonical Business Contact Parameters
    phoneDisplay: "+91 86069 18247",
    phoneHref: "tel:+918606918247",
    whatsappNumber: "+91 86069 18247",
    whatsappUrl: "https://wa.me/918606918247",
    email: "admin@craftegon.com",
    emailHref: "mailto:admin@craftegon.com",
    
    // Canonical Domain
    domain: "https://craftegon.com",
    liveUrl: "https://ccs.craftegon.com",
    
    // Quick-action prefilled inquiry generator
    getWhatsAppUrl: function (topic) {
      const text = topic 
        ? encodeURIComponent(`Hello CraftEgon Compliance Desk, I would like to consult on: ${topic}.`)
        : encodeURIComponent("Hello CraftEgon Compliance Desk, I would like to consult on corporate compliance services.");
      return `${this.whatsappUrl}?text=${text}`;
    },
    
    getEmailUrl: function (subject) {
      const subj = subject ? encodeURIComponent(subject) : encodeURIComponent("Corporate Compliance Inquiry");
      return `${this.emailHref}?subject=${subj}`;
    }
  };

  if (typeof window !== "undefined") {
    window.CRAFTEGON_CONFIG = config;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = config;
  }
})();
