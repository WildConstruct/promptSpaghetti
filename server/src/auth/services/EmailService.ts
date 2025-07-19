// Epic 11 Email Service
// Email delivery service for authentication workflows

import { AuthConfig } from '../types';
import { EMAIL_TEMPLATES } from '../config';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailContext {
  displayName?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  timestamp?: Date;
}

export class EmailService {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  async sendEmailVerification(
    email: string,
    token: string,
    context: EmailContext = {}
  ): Promise<void> {
    const verificationUrl = this.buildVerificationUrl(token);
    
    const template = this.renderEmailTemplate('emailVerification', {
      email,
      verificationUrl,
      displayName: context.displayName || email.split('@')[0],
      expiryHours: Math.floor(this.config.security.emailVerificationTokenExpiry / 60),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      timestamp: context.timestamp || new Date(),
    });

    await this.sendEmail(email, template);
  }

  async sendPasswordReset(
    email: string,
    token: string,
    context: EmailContext = {}
  ): Promise<void> {
    const resetUrl = this.buildPasswordResetUrl(token);
    
    const template = this.renderEmailTemplate('passwordReset', {
      email,
      resetUrl,
      displayName: context.displayName || email.split('@')[0],
      expiryHours: Math.floor(this.config.security.passwordResetTokenExpiry / 60),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      timestamp: context.timestamp || new Date(),
    });

    await this.sendEmail(email, template);
  }

  async sendPasswordChanged(
    email: string,
    context: EmailContext = {}
  ): Promise<void> {
    const template = this.renderEmailTemplate('passwordChanged', {
      email,
      displayName: context.displayName || email.split('@')[0],
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      timestamp: context.timestamp || new Date(),
    });

    await this.sendEmail(email, template);
  }

  async sendLoginAlert(
    email: string,
    context: EmailContext = {}
  ): Promise<void> {
    const template = this.renderEmailTemplate('loginAlert', {
      email,
      displayName: context.displayName || email.split('@')[0],
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      deviceInfo: context.deviceInfo,
      timestamp: context.timestamp || new Date(),
    });

    await this.sendEmail(email, template);
  }

  async sendAccountLocked(
    email: string,
    unlockTime: Date,
    context: EmailContext = {}
  ): Promise<void> {
    const template = this.renderEmailTemplate('accountLocked', {
      email,
      displayName: context.displayName || email.split('@')[0],
      unlockTime,
      unlockTimeFormatted: unlockTime.toLocaleString(),
      supportEmail: this.config.emailService?.fromEmail || 'support@promptscape.com',
      timestamp: context.timestamp || new Date(),
    });

    await this.sendEmail(email, template);
  }

  async sendWelcomeEmail(
    email: string,
    context: EmailContext & { hasInvitation?: boolean } = {}
  ): Promise<void> {
    const template = this.renderEmailTemplate('welcome', {
      email,
      displayName: context.displayName || email.split('@')[0],
      hasInvitation: context.hasInvitation || false,
      dashboardUrl: this.buildDashboardUrl(),
      timestamp: context.timestamp || new Date(),
    });

    await this.sendEmail(email, template);
  }

  async sendInvitation(
    email: string,
    inviterName: string,
    organizationName: string,
    invitationToken: string,
    context: EmailContext = {}
  ): Promise<void> {
    const invitationUrl = this.buildInvitationUrl(invitationToken);
    
    const template = this.renderEmailTemplate('invitation', {
      email,
      inviterName,
      organizationName,
      invitationUrl,
      expiryDays: 7, // Default invitation expiry
      timestamp: context.timestamp || new Date(),
    });

    await this.sendEmail(email, template);
  }

  // Enhanced password reset methods for PasswordResetService
  async sendPasswordResetEmail(data: {
    to: string;
    firstName: string;
    resetUrl: string;
    expiresAt: Date;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    const template = this.renderEmailTemplate('passwordReset', {
      email: data.to,
      displayName: data.firstName,
      resetUrl: data.resetUrl,
      expiryHours: Math.floor((data.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      timestamp: new Date(),
    });

    await this.sendEmail(data.to, template);
  }

  async sendPasswordResetConfirmationEmail(data: {
    to: string;
    firstName: string;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
  }): Promise<void> {
    const template = this.renderEmailTemplate('passwordChanged', {
      email: data.to,
      displayName: data.firstName,
      timestamp: data.timestamp,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    await this.sendEmail(data.to, template);
  }

  private async sendEmail(email: string, template: EmailTemplate): Promise<void> {
    if (!this.config.emailService) {
      console.log('Email service not configured. Would send email:');
      console.log(`To: ${email}`);
      console.log(`Subject: ${template.subject}`);
      console.log(`Body: ${template.text || template.html}`);
      return;
    }

    try {
      // In production, integrate with email service like SendGrid, AWS SES, etc.
      // For now, we'll simulate the email sending
      
      const emailData = {
        from: {
          email: this.config.emailService.fromEmail,
          name: this.config.emailService.fromName,
        },
        to: [{ email }],
        subject: template.subject,
        html: template.html,
        text: template.text,
      };

      // TODO: Implement actual email service integration
      // Example with SendGrid:
      // await sgMail.send(emailData);
      
      console.log(`Email sent to ${email}: ${template.subject}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  private renderEmailTemplate(templateName: string, data: any): EmailTemplate {
    const templates: Record<string, EmailTemplate> = {
      emailVerification: {
        subject: 'Verify your email address - PromptScape',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Email Verification</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; }
              .button { 
                display: inline-block; 
                background: #4f46e5; 
                color: white; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0;
              }
              .footer { background: #f8f9fa; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to PromptScape!</h1>
              </div>
              <div class="content">
                <h2>Hi ${data.displayName},</h2>
                <p>Thank you for signing up for PromptScape. To complete your registration and start using our platform, please verify your email address.</p>
                
                <p style="text-align: center;">
                  <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
                </p>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                  ${data.verificationUrl}
                </p>
                
                <p><strong>This link will expire in ${data.expiryHours} hours.</strong></p>
                
                <p>If you didn't create an account with us, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>This email was sent from ${data.ipAddress || 'unknown IP'} at ${data.timestamp?.toLocaleString()}.</p>
                <p>© 2025 PromptScape. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Welcome to PromptScape!
          
          Hi ${data.displayName},
          
          Thank you for signing up for PromptScape. To complete your registration, please verify your email address by visiting:
          
          ${data.verificationUrl}
          
          This link will expire in ${data.expiryHours} hours.
          
          If you didn't create an account with us, please ignore this email.
          
          © 2025 PromptScape. All rights reserved.
        `,
      },

      passwordReset: {
        subject: 'Reset your password - PromptScape',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Password Reset</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; }
              .button { 
                display: inline-block; 
                background: #dc2626; 
                color: white; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0;
              }
              .footer { background: #f8f9fa; padding: 20px; font-size: 12px; color: #666; }
              .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <h2>Hi ${data.displayName},</h2>
                <p>We received a request to reset the password for your PromptScape account.</p>
                
                <p style="text-align: center;">
                  <a href="${data.resetUrl}" class="button">Reset Password</a>
                </p>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                  ${data.resetUrl}
                </p>
                
                <div class="warning">
                  <strong>Important:</strong> This link will expire in ${data.expiryHours} hours. If you didn't request this password reset, please ignore this email or contact support if you're concerned about your account security.
                </div>
                
                <p>For your security, this request was made from IP address: ${data.ipAddress || 'unknown'}</p>
              </div>
              <div class="footer">
                <p>This email was sent at ${data.timestamp?.toLocaleString()}.</p>
                <p>© 2025 PromptScape. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Password Reset Request
          
          Hi ${data.displayName},
          
          We received a request to reset the password for your PromptScape account.
          
          Reset your password by visiting: ${data.resetUrl}
          
          This link will expire in ${data.expiryHours} hours.
          
          If you didn't request this password reset, please ignore this email.
          
          For your security, this request was made from IP address: ${data.ipAddress || 'unknown'}
          
          © 2025 PromptScape. All rights reserved.
        `,
      },

      passwordChanged: {
        subject: 'Your password has been changed - PromptScape',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Password Changed</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #059669; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; }
              .footer { background: #f8f9fa; padding: 20px; font-size: 12px; color: #666; }
              .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Changed Successfully</h1>
              </div>
              <div class="content">
                <h2>Hi ${data.displayName},</h2>
                <p>Your PromptScape account password has been successfully changed.</p>
                
                <div class="warning">
                  <strong>Didn't change your password?</strong> If you didn't make this change, please contact our support team immediately and consider changing your password again.
                </div>
                
                <p>For your security, here are the details of this change:</p>
                <ul>
                  <li><strong>Time:</strong> ${data.timestamp?.toLocaleString()}</li>
                  <li><strong>IP Address:</strong> ${data.ipAddress || 'unknown'}</li>
                  <li><strong>Device:</strong> ${data.userAgent || 'unknown'}</li>
                </ul>
                
                <p>If this was you, no further action is needed. Your account is secure.</p>
              </div>
              <div class="footer">
                <p>© 2025 PromptScape. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Password Changed Successfully
          
          Hi ${data.displayName},
          
          Your PromptScape account password has been successfully changed.
          
          Change details:
          - Time: ${data.timestamp?.toLocaleString()}
          - IP Address: ${data.ipAddress || 'unknown'}
          - Device: ${data.userAgent || 'unknown'}
          
          If you didn't make this change, please contact support immediately.
          
          © 2025 PromptScape. All rights reserved.
        `,
      },

      welcome: {
        subject: 'Welcome to PromptScape!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to PromptScape</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; }
              .button { 
                display: inline-block; 
                background: #4f46e5; 
                color: white; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0;
              }
              .footer { background: #f8f9fa; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to PromptScape!</h1>
              </div>
              <div class="content">
                <h2>Hi ${data.displayName},</h2>
                <p>Your account is now verified and ready to use! Welcome to the PromptScape community.</p>
                
                ${data.hasInvitation ? 
                  '<p>You were invited to join an organization. You\'ll find your team and projects waiting for you in your dashboard.</p>' :
                  '<p>You\'re all set to start creating amazing prompt graphs and exploring our powerful features.</p>'
                }
                
                <p style="text-align: center;">
                  <a href="${data.dashboardUrl}" class="button">Go to Dashboard</a>
                </p>
                
                <h3>What's next?</h3>
                <ul>
                  <li>Complete your profile setup</li>
                  <li>Create your first prompt graph</li>
                  <li>Explore our example templates</li>
                  <li>Join our community forum</li>
                </ul>
                
                <p>If you have any questions, our support team is here to help. Just reply to this email!</p>
              </div>
              <div class="footer">
                <p>© 2025 PromptScape. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Welcome to PromptScape!
          
          Hi ${data.displayName},
          
          Your account is now verified and ready to use! Welcome to the PromptScape community.
          
          Get started: ${data.dashboardUrl}
          
          What's next?
          - Complete your profile setup
          - Create your first prompt graph
          - Explore our example templates
          - Join our community forum
          
          © 2025 PromptScape. All rights reserved.
        `,
      },

      invitation: {
        subject: `You're invited to join ${data.organizationName} on PromptScape`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Team Invitation</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; }
              .button { 
                display: inline-block; 
                background: #7c3aed; 
                color: white; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0;
              }
              .footer { background: #f8f9fa; padding: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 You're Invited!</h1>
              </div>
              <div class="content">
                <h2>Hi there,</h2>
                <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.organizationName}</strong> on PromptScape.</p>
                
                <p style="text-align: center;">
                  <a href="${data.invitationUrl}" class="button">Accept Invitation</a>
                </p>
                
                <p>PromptScape is a powerful platform for creating and managing prompt graphs. Join your team to collaborate on exciting projects!</p>
                
                <p><strong>This invitation will expire in ${data.expiryDays} days.</strong></p>
                
                <p>If you don't want to join this organization, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p>© 2025 PromptScape. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          You're invited to join ${data.organizationName} on PromptScape!
          
          ${data.inviterName} has invited you to join their team.
          
          Accept your invitation: ${data.invitationUrl}
          
          This invitation will expire in ${data.expiryDays} days.
          
          © 2025 PromptScape. All rights reserved.
        `,
      },
    };

    return templates[templateName] || {
      subject: 'Notification from PromptScape',
      html: '<p>This is a test email.</p>',
      text: 'This is a test email.',
    };
  }

  private buildVerificationUrl(token: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/verify-email?token=${token}`;
  }

  private buildPasswordResetUrl(token: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/reset-password?token=${token}`;
  }

  private buildInvitationUrl(token: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/join?token=${token}`;
  }

  private buildDashboardUrl(): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/dashboard`;
  }
}