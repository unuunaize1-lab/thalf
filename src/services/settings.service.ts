import { prisma } from '@/lib/prisma';

export interface WhatsAppConfig {
  phoneNumber: string;
  displayName: string;
  enabled: boolean;
  messageFooter: string;
}

export interface MarketingConfig {
  announcementText: string;
  announcementActive: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
}

export const DEFAULT_WHATSAPP_CONFIG: WhatsAppConfig = {
  phoneNumber: '919061107915',
  displayName: 'THALF Artisanal Concierge',
  enabled: true,
  messageFooter: 'Please confirm my order and share the payment details.\n\nThank you.',
};

export const DEFAULT_MARKETING_CONFIG: MarketingConfig = {
  announcementText: 'Complimentary Express Shipping on Orders Above ₹2,500 | WhatsApp Order Support: +91 90611 07915',
  announcementActive: true,
  heroTitle: 'Chocolate, crafted differently.',
  heroSubtitle: 'A contemporary expression of chocolate, created for moments worth remembering. Thoughtfully presented, balanced in sweetness, and made to share.',
  heroButtonText: 'Shop Chocolates',
};

export class SettingsService {
  async getSetting(key: string, defaultValue: string = ''): Promise<string> {
    try {
      const setting = await prisma.settings.findUnique({ where: { key } });
      return setting ? setting.value : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  async setSetting(key: string, value: string, description?: string) {
    return prisma.settings.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  }

  async getWhatsAppConfig(): Promise<WhatsAppConfig> {
    const phone = await this.getSetting('whatsapp_number', DEFAULT_WHATSAPP_CONFIG.phoneNumber);
    const name = await this.getSetting('whatsapp_display_name', DEFAULT_WHATSAPP_CONFIG.displayName);
    const enabledStr = await this.getSetting('whatsapp_enabled', 'true');
    const footer = await this.getSetting('whatsapp_footer', DEFAULT_WHATSAPP_CONFIG.messageFooter);

    return {
      phoneNumber: phone,
      displayName: name,
      enabled: enabledStr === 'true',
      messageFooter: footer,
    };
  }

  async updateWhatsAppConfig(config: Partial<WhatsAppConfig>) {
    if (config.phoneNumber !== undefined) {
      await this.setSetting('whatsapp_number', config.phoneNumber, 'WhatsApp business contact number');
    }
    if (config.displayName !== undefined) {
      await this.setSetting('whatsapp_display_name', config.displayName, 'Business display name');
    }
    if (config.enabled !== undefined) {
      await this.setSetting('whatsapp_enabled', String(config.enabled), 'WhatsApp ordering enabled toggle');
    }
    if (config.messageFooter !== undefined) {
      await this.setSetting('whatsapp_footer', config.messageFooter, 'Default WhatsApp message footer');
    }
    return this.getWhatsAppConfig();
  }

  async getMarketingConfig(): Promise<MarketingConfig> {
    const text = await this.getSetting('announcement_text', DEFAULT_MARKETING_CONFIG.announcementText);
    const activeStr = await this.getSetting('announcement_active', 'true');
    const title = await this.getSetting('hero_title', DEFAULT_MARKETING_CONFIG.heroTitle);
    const subtitle = await this.getSetting('hero_subtitle', DEFAULT_MARKETING_CONFIG.heroSubtitle);
    const buttonText = await this.getSetting('hero_button_text', DEFAULT_MARKETING_CONFIG.heroButtonText);

    return {
      announcementText: text,
      announcementActive: activeStr === 'true',
      heroTitle: title,
      heroSubtitle: subtitle,
      heroButtonText: buttonText,
    };
  }

  async updateMarketingConfig(config: Partial<MarketingConfig>) {
    if (config.announcementText !== undefined) {
      await this.setSetting('announcement_text', config.announcementText, 'Top Announcement Bar text message');
    }
    if (config.announcementActive !== undefined) {
      await this.setSetting('announcement_active', String(config.announcementActive), 'Top Announcement Bar active toggle');
    }
    if (config.heroTitle !== undefined) {
      await this.setSetting('hero_title', config.heroTitle, 'Homepage Hero title headline');
    }
    if (config.heroSubtitle !== undefined) {
      await this.setSetting('hero_subtitle', config.heroSubtitle, 'Homepage Hero subtitle description');
    }
    if (config.heroButtonText !== undefined) {
      await this.setSetting('hero_button_text', config.heroButtonText, 'Homepage Hero CTA button text');
    }
    return this.getMarketingConfig();
  }
}

export const settingsService = new SettingsService();
