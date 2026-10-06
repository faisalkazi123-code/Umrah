CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_session_id" uuid NOT NULL,
	"dua_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookmarks_guest_dua_uq" UNIQUE("guest_session_id","dua_id")
);
--> statement-breakpoint
CREATE TABLE "checklist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"section" text NOT NULL,
	"position" integer NOT NULL,
	"audience" text NOT NULL,
	"label_en" text NOT NULL,
	"label_ar" text,
	"source_document" text NOT NULL,
	"source_section" text,
	"source_page" integer,
	"source_reference" text,
	"review_status" text NOT NULL,
	CONSTRAINT "checklist_items_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "content_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" text NOT NULL,
	"content_key" text NOT NULL,
	"version" integer NOT NULL,
	"status" text NOT NULL,
	"data" jsonb NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_versions_uq" UNIQUE("content_type","content_key","version")
);
--> statement-breakpoint
CREATE TABLE "duas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"category" text NOT NULL,
	"title_en" text NOT NULL,
	"title_ar" text,
	"arabic" text,
	"transliteration" text,
	"meaning_en" text,
	"meaning_ar" text,
	"audio_url" text,
	"source_document" text NOT NULL,
	"source_section" text,
	"source_page" integer,
	"source_reference" text,
	"review_status" text NOT NULL,
	CONSTRAINT "duas_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "guest_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guest_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "journey_checklist" (
	"journey_id" uuid NOT NULL,
	"checklist_item_id" uuid NOT NULL,
	"checked" boolean NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "journey_checklist_journey_id_checklist_item_id_pk" PRIMARY KEY("journey_id","checklist_item_id")
);
--> statement-breakpoint
CREATE TABLE "journeys" (
	"id" uuid PRIMARY KEY NOT NULL,
	"guest_session_id" uuid NOT NULL,
	"niyyah_done" boolean DEFAULT false NOT NULL,
	"talbiyah_done" boolean DEFAULT false NOT NULL,
	"haram_entered" boolean DEFAULT false NOT NULL,
	"shaving_done" boolean DEFAULT false NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saee_progress" (
	"journey_id" uuid PRIMARY KEY NOT NULL,
	"state" text DEFAULT 'NOT_STARTED' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"position" integer NOT NULL,
	"title_en" text NOT NULL,
	"title_ar" text NOT NULL,
	CONSTRAINT "stages_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"group" text NOT NULL,
	"position" integer NOT NULL,
	"audience" text NOT NULL,
	"title_en" text NOT NULL,
	"title_ar" text,
	"body_en" text,
	"body_ar" text,
	"source_document" text NOT NULL,
	"source_section" text,
	"source_page" integer,
	"source_reference" text,
	"review_status" text NOT NULL,
	CONSTRAINT "steps_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tawaf_progress" (
	"journey_id" uuid PRIMARY KEY NOT NULL,
	"state" text DEFAULT 'NOT_STARTED' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_guest_session_id_guest_sessions_id_fk" FOREIGN KEY ("guest_session_id") REFERENCES "public"."guest_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_dua_id_duas_id_fk" FOREIGN KEY ("dua_id") REFERENCES "public"."duas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_sessions" ADD CONSTRAINT "guest_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_checklist" ADD CONSTRAINT "journey_checklist_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_checklist" ADD CONSTRAINT "journey_checklist_checklist_item_id_checklist_items_id_fk" FOREIGN KEY ("checklist_item_id") REFERENCES "public"."checklist_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_guest_session_id_guest_sessions_id_fk" FOREIGN KEY ("guest_session_id") REFERENCES "public"."guest_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saee_progress" ADD CONSTRAINT "saee_progress_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tawaf_progress" ADD CONSTRAINT "tawaf_progress_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "journeys_guest_idx" ON "journeys" USING btree ("guest_session_id");--> statement-breakpoint
CREATE INDEX "steps_group_idx" ON "steps" USING btree ("group");