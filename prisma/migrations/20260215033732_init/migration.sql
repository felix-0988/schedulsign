-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('GOOGLE_MEET', 'ZOOM', 'IN_PERSON', 'PHONE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'TEXTAREA', 'SELECT', 'RADIO', 'CHECKBOX', 'PHONE', 'EMAIL');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'RESCHEDULED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "CalendarProvider" AS ENUM ('GOOGLE', 'OUTLOOK');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'SIGNED', 'COMPLETED', 'VOIDED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "stripeCurrentPeriodEnd" TIMESTAMP(3),
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "brandColor" TEXT NOT NULL DEFAULT '#2563eb',
    "brandLogo" TEXT,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventType" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "location" "LocationType" NOT NULL DEFAULT 'GOOGLE_MEET',
    "customLocation" TEXT,
    "color" TEXT NOT NULL DEFAULT '#2563eb',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "bufferBefore" INTEGER NOT NULL DEFAULT 0,
    "bufferAfter" INTEGER NOT NULL DEFAULT 0,
    "dailyLimit" INTEGER,
    "weeklyLimit" INTEGER,
    "minNotice" INTEGER NOT NULL DEFAULT 120,
    "maxFutureDays" INTEGER NOT NULL DEFAULT 60,
    "requirePayment" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "isCollective" BOOLEAN NOT NULL DEFAULT false,
    "collectiveMembers" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomQuestion" (
    "id" TEXT NOT NULL,
    "eventTypeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'TEXT',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CustomQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "eventTypeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "bookerName" TEXT NOT NULL,
    "bookerEmail" TEXT NOT NULL,
    "bookerTimezone" TEXT NOT NULL,
    "bookerPhone" TEXT,
    "location" "LocationType" NOT NULL,
    "meetingUrl" TEXT,
    "meetingId" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paymentAmount" DOUBLE PRECISION,
    "stripePaymentIntentId" TEXT,
    "answers" JSONB,
    "cancelReason" TEXT,
    "rescheduleUid" TEXT,
    "reminderSentAt" TIMESTAMP(3),
    "smsReminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "date" TIMESTAMP(3),
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "CalendarProvider" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "email" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "secret" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "EventType_userId_slug_key" ON "EventType"("userId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_uid_key" ON "Booking"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarConnection_userId_provider_email_key" ON "CalendarConnection"("userId", "provider", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_userId_email_key" ON "Contact"("userId", "email");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventType" ADD CONSTRAINT "EventType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomQuestion" ADD CONSTRAINT "CustomQuestion_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarConnection" ADD CONSTRAINT "CalendarConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
