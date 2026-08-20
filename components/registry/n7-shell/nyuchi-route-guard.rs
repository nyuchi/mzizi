//! NYUCHI ROUTE GUARD — N7 shell.
//!
//! The Rust sibling of `nyuchi-route-guard.tsx`'s gating logic: route-level protection composed
//! of auth/role/subscription/verification checks.
//!
//! # The `.tsx`'s gates fail open, not closed
//!
//! Each optional check in the `.tsx` is guarded by `&&` against the corresponding user
//! attribute: `if (pass && config.roles?.length && userRole)`, and the same shape for
//! subscription and verification. When a route REQUIRES one of these but the user's value is
//! `undefined` — not yet loaded, or genuinely absent — the whole check is skipped and `pass`
//! stays `true`. A route gated on `subscription: "premium"` lets through a user whose tier
//! hasn't loaded yet. [`evaluate`] fails closed instead: a required attribute that is missing
//! denies access, the same as one that doesn't meet the bar.
//!
//! **The `.tsx` sibling still has this.**
//!
//! This file models only the gate itself — the pure decision behind the `.tsx`'s `check()`
//! effect. The Dioxus rendering shell around it (loading spinner / unauthorized fallback /
//! children) is a thin wrapper with nothing else worth testing.

/// What level of authentication a route requires.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AuthRequirement {
    /// No authentication required.
    None,
    /// Any signed-in user.
    Authenticated,
    /// A verified account.
    Verified,
    /// An admin account.
    Admin,
}

/// A route's access requirements.
#[derive(Clone, Debug, Default)]
pub struct RouteGuardConfig {
    /// Authentication level required, if any.
    pub auth: Option<AuthRequirement>,
    /// Roles allowed to access the route; empty means no role restriction.
    pub roles: Vec<String>,
    /// Minimum subscription tier required, if any.
    pub subscription: Option<String>,
    /// Minimum verification tier required, if any.
    pub verification_tier: Option<String>,
}

/// The current user's state as known by the host.
#[derive(Clone, Debug, Default)]
pub struct UserState {
    /// Whether the user is signed in.
    pub is_authenticated: bool,
    /// The user's role, if known.
    pub role: Option<String>,
    /// The user's subscription tier, if known.
    pub tier: Option<String>,
    /// The user's verification tier, if known.
    pub verification: Option<String>,
}

fn tier_rank(tiers: &[&str], value: &str) -> Option<usize> {
    tiers.iter().position(|t| *t == value)
}

const SUBSCRIPTION_TIERS: [&str; 4] = ["free", "premium", "business", "enterprise"];
const VERIFICATION_TIERS: [&str; 5] = ["unverified", "community", "otp", "government", "licensed"];

/// Evaluates the gate. Returns `true` (allowed) or `false` (denied) — see the module docs for
/// how this differs from the `.tsx`'s fail-open behaviour.
pub fn evaluate(config: &RouteGuardConfig, user: &UserState) -> bool {
    if let Some(auth) = config.auth {
        if auth != AuthRequirement::None && !user.is_authenticated {
            return false;
        }
    }

    if !config.roles.is_empty() {
        match &user.role {
            Some(role) if config.roles.iter().any(|r| r == role) => {}
            _ => return false,
        }
    }

    if let Some(required) = &config.subscription {
        let required_rank = tier_rank(&SUBSCRIPTION_TIERS, required);
        let user_rank = user
            .tier
            .as_deref()
            .and_then(|t| tier_rank(&SUBSCRIPTION_TIERS, t));
        match (user_rank, required_rank) {
            (Some(u), Some(r)) if u >= r => {}
            _ => return false,
        }
    }

    if let Some(required) = &config.verification_tier {
        let required_rank = tier_rank(&VERIFICATION_TIERS, required);
        let user_rank = user
            .verification
            .as_deref()
            .and_then(|t| tier_rank(&VERIFICATION_TIERS, t));
        match (user_rank, required_rank) {
            (Some(u), Some(r)) if u >= r => {}
            _ => return false,
        }
    }

    true
}

#[cfg(test)]
mod tests {
    use super::*;

    fn base_user() -> UserState {
        UserState {
            is_authenticated: true,
            role: None,
            tier: None,
            verification: None,
        }
    }

    #[test]
    fn unauthenticated_is_denied_when_auth_required() {
        let config = RouteGuardConfig {
            auth: Some(AuthRequirement::Authenticated),
            ..Default::default()
        };
        let user = UserState {
            is_authenticated: false,
            ..base_user()
        };
        assert!(!evaluate(&config, &user));
    }

    #[test]
    fn missing_role_is_denied_not_silently_passed() {
        // The .tsx: `if (pass && config.roles?.length && userRole)` — a
        // route requiring roles but a user with no role at all (not yet
        // loaded) skips the check and passes. Fixed here to deny.
        let config = RouteGuardConfig {
            roles: vec!["admin".into()],
            ..Default::default()
        };
        let user = base_user();
        assert!(!evaluate(&config, &user));
    }

    #[test]
    fn matching_role_is_allowed() {
        let config = RouteGuardConfig {
            roles: vec!["admin".into()],
            ..Default::default()
        };
        let user = UserState {
            role: Some("admin".into()),
            ..base_user()
        };
        assert!(evaluate(&config, &user));
    }

    #[test]
    fn missing_subscription_tier_is_denied_not_silently_passed() {
        let config = RouteGuardConfig {
            subscription: Some("premium".into()),
            ..Default::default()
        };
        let user = base_user();
        assert!(!evaluate(&config, &user));
    }

    #[test]
    fn lower_subscription_tier_is_denied() {
        let config = RouteGuardConfig {
            subscription: Some("business".into()),
            ..Default::default()
        };
        let user = UserState {
            tier: Some("free".into()),
            ..base_user()
        };
        assert!(!evaluate(&config, &user));
    }

    #[test]
    fn equal_or_higher_subscription_tier_is_allowed() {
        let config = RouteGuardConfig {
            subscription: Some("premium".into()),
            ..Default::default()
        };
        let user = UserState {
            tier: Some("enterprise".into()),
            ..base_user()
        };
        assert!(evaluate(&config, &user));
    }

    #[test]
    fn missing_verification_tier_is_denied_not_silently_passed() {
        let config = RouteGuardConfig {
            verification_tier: Some("government".into()),
            ..Default::default()
        };
        let user = base_user();
        assert!(!evaluate(&config, &user));
    }

    #[test]
    fn no_requirements_allows_any_authenticated_user() {
        let config = RouteGuardConfig::default();
        assert!(evaluate(&config, &base_user()));
    }
}
