# Git History Security Remediation

## Finding

The current working tree contains no credential-like values, but the public repository history contains one earlier commit with credential-pattern matches. A normal cleanup commit cannot remove those values from existing Git objects or cached clones.

## Safe action taken

The repository was cleaned and the remediation commit was pushed without rewriting public history. This preserves the existing branch topology and avoids an unreviewed force-push that could disrupt buyer references or other clones.

## Required owner action

1. Rotate or revoke any Supabase project key, user password, or other credential that may still be active. Treat the historical values as compromised.
2. Decide whether the repository should retain its current history. If the values were only public anon configuration, rotation may be sufficient; if any password or privileged secret was exposed, history scrubbing is strongly recommended.
3. Before rewriting, make a private backup clone and notify anyone who may have cloned the repository.
4. Use an approved history-rewrite tool such as `git filter-repo` to replace the exposed strings across all refs, inspect the rewritten history, run the full verification suite, and force-push only after explicit owner approval.
5. Rotate credentials again after the rewrite if there is any uncertainty about cached clones, forks, or hosting logs.

Do not put replacement credentials into the rewrite command or this repository. Use environment variables or an interactive secret-management process outside version control.

## Listing language

The project may be listed as security-cleaned in the current working tree, but it should not be described as having a fully scrubbed Git history until the owner completes and verifies the optional history rewrite.
