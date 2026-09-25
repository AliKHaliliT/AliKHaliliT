# 0028. Let a role name more than one employment kind

Status: Accepted
Date: 2026-09-25

## Context

An experience entry named its employment kind in one field that held one word, full-time,
part-time, internship, contract, or freelance. Those words describe two different things,
the hours a role takes and the terms it is held on, so a real role can be two of them at
once. A graduate assistantship held as a part-time contract had to drop one half to fit.
The type allowed only the five words, but nothing at the door checked them, so a value
outside the list reached the page as raw text.

## Evidence

The door's suite gained five tests and the label module a suite of three, and the two
were mutated eight ways before landing. The mutants dropped the check, accepted an empty
list, accepted an unknown kind, rejected every list, applied the check to other
collections, and made the reader drop, invent, or reorder kinds. A test failed for each.

## Options considered

- **Split the field into hours and terms.** It models the two things apart, but every
  entry and the admin panel's form would migrate, and an existing contract role would need
  hours nobody recorded. Refused as more change than the problem asks for.
- **Add combined words such as contract-part-time.** It multiplies the list for every
  pairing and still cannot say three things. Refused.

## Decision

`employmentType` holds one kind or a list of kinds, each from the five the label map
names, and a single value stays valid everywhere. The door refuses an unknown kind or an
empty list, naming the field, so a bad value fails at the file or the storage key instead
of reaching a page. The experience page and the home page show one badge per kind, and
search reads each kind as a fact.

## Consequences

A role says what it is without losing half of it. The admin panel's editor, which sets
this field, has to write a list too, and the resume builder never reads the field. A
deployment carries the change with the template's source.
