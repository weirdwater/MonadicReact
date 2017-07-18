## doing
- documentation
- new repository structure
- cleanup dependencies in imports (samples and monad definition)
- improve file names in small sample

## GO (7 days)
- [ ] info pages
  - [ ] welcome
  - [ ] manifesto
  - [ ] contact
- [ ] login/logout
- [ ] course selection
- [ ] lecture selection
- [ ] exam selection
- [ ] dashboard


## various improvements (1 day)
- [ ] div takes no useless array of arguments
- [ ] any/repeat take as first parameters the optional ones
- [ ] repeat-from, a wrapper on repeat which takes as first input the initial value A
- [ ] new repository structure with large sample inside library, but referencing library files directly
- [ ] cleanup dependencies in imports (samples and monad definition)
- [x] improve scaffolder-related names in small sample
- [/] mode should always also check context.mode

## samples (3 days)
- [ ] all primitives, one per sample (use menu nesting)
- [ ] all
- [ ] workflow/form with selection from list of other entities
- [ ] form with list of related entities
- [ ] form with
  - [1/3] date, time, date-time
  - [ ] custom field in form
  - [ ] rich-text
  - [ ] tel, url, email
  - [ ] file
  - [x] lazy-file
- [x] list and paginator samples in own files
- [x] edit list
- [ ] paginated list of entities
- [x] files

## external (3 days)
- [x] i18n
- [ ] documentation
  - [ ] verify all snippets
  - [ ] screenshots
- [x] publish online for designers
- [ ] remove dotnet core from sample
  - [ ] restore samples requireing an API: file, forms, workflow
- [ ] linkedin post
- [ ] reddit post

## styling
- [x] menu
- [x] tabs
- [/] form errors
- [x] disabled plus/minus toggle
- [ ] plus/minus has disappeared
- [ ] radio buttons
- [ ] edit lists and monadic-list-item
- [ ] links
- [ ] overlays
- [ ] pagination
- [ ] rich text (all text styles and images)
- [ ] toggle without label (for example within an edit list)
- [ ] tabs "pagination"
- [ ] busy/error in lift promise
- [ ] hierarchical menu

##  scaffolder (4 days)
- [ ] Api.getMWithPictures/updateMWithPictures operators should already be lifted out of the box (from the scaffolder)
- [ ] Api.getM/updateM/download_pic/upload_pic operators should already be lifted out of the box (from the scaffolder)
- [?] per-attribute comparison functions should be scaffolded, with and without pictures
- [ ] default scaffolder views should use the monadic library

## fridge
- [ ] fold
- [ ] mapM
- [ ] mapL
- [ ] className by default in all CmdCommon
- [ ] add math plugin https://github.com/efloti/draft-js-mathjax-plugin
- [ ] also parse url query