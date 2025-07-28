export interface InteractiveElement {
    id: string;
    type: InteractiveElementType;
    name: string;
    description: string;
    config: ElementConfiguration;
    state: ElementState;
    interactions: Interaction;
    analytics: ElementAnalytics;
    targetContext: TargetContext;
    triggers: ElementTrigger;
    conditions: ElementCondition;
    created: Date;
    lastUpdated: Date;
    version: string;
    status: ElementStatus;
    integrations: ElementIntegration;
    dependencies: string;
}
export declare enum InteractiveElementType {
    LIVE_CHAT = "live_chat",
    REAL_TIME_NOTIFICATIONS = "real_time_notifications",
    ACTIVITY_FEED = "activity_feed",
    COLLABORATIVE_EDITOR = "collaborative_editor",
    PROGRESS_BAR = "progress_bar",
    ACHIEVEMENT_UNLOCK = "achievement_unlock",
    LEADERBOARD = "leaderboard",
    POINTS_SYSTEM = "points_system",
    BADGE_COLLECTION = "badge_collection",
    STREAK_TRACKER = "streak_tracker",
    RATING_SYSTEM = "rating_system",
    REVIEW_WIDGET = "review_widget",
    SOCIAL_SHARING = "social_sharing",
    USER_PROFILES = "user_profiles",
    FOLLOW_SYSTEM = "follow_system",
    MENTION_SYSTEM = "mention_system",
    QUICK_PREVIEW = "quick_preview",
    COMPARISON_TOOL = "comparison_tool",
    WISHLIST = "wishlist",
    SHOPPING_CART = "shopping_cart",
    CHECKOUT_FLOW = "checkout_flow",
    PRICE_TRACKER = "price_tracker",
    INTERACTIVE_DEMO = "interactive_demo",
    CODE_PLAYGROUND = "code_playground",
    TEMPLATE_CUSTOMIZER = "template_customizer",
    LIVE_PREVIEW = "live_preview",
    DRAG_DROP_BUILDER = "drag_drop_builder",
    DISCUSSION_FORUM = "discussion_forum",
    Q_A_SYSTEM = "q_a_system",
    VOTING_SYSTEM = "voting_system",
    MODERATION_TOOLS = "moderation_tools",
    EVENT_CALENDAR = "event_calendar",
    FEEDBACK_WIDGET = "feedback_widget",
    SURVEY_MODAL = "survey_modal",
    NPS_WIDGET = "nps_widget",
    HELP_TOOLTIP = "help_tooltip",
    GUIDED_TOUR = "guided_tour",
    export,
    enum,
    ElementStatus
}
//# sourceMappingURL=Epic16InteractiveElementsService.d.ts.map